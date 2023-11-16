const {
  BadRequestError,
  NotFoundError,
  MissingData,
} = require('../core/error.response')
const { Conversation } = require('../models/conversation.model')
const {
  checkConversation,
} = require('../models/repositories/conversation.repo')
const {
  updateUserById,
  findUsers,
  findUserById,
  checkUser,
  getAllBlock,
  findProfileUserById,
  searchUser,
} = require('../models/repositories/user.repo')
const { User } = require('../models/user.model')
const { notificationProducer } = require('../rabbitmq/producerDLX')
const { convertToString } = require('../utils')
const { unFriendOrCancelNotification } = require('./notification.service')
const {
  handleGetConversationStatus,
  handleGetUserStatus,
} = require('./redis.service')
const bcrypt = require('bcrypt')
const Otp = require('../models/otp.model')
const otpGenerator = require('otp-generator')
const OtpService = require('./otp.service')
const { searchPosts } = require('../models/repositories/post.repo')

class UserService {
  static getAllFriendsUser = async ({ userId, page, limit }) => {
    const block = await getAllBlock(userId)
    const filter = {
      $and: [{ friends: userId.toString() }, { friends: { $nin: block } }],
    }
    return await findUsers({ filter, page, limit })
  }

  static findFriendsByName = async ({ name, userId, page = 1, limit = 20 }) => {
    const user = await findUserById(userId)
    return await User.find(
      {
        $text: { $search: name },
        _id: { $in: user.friends },
      },
      {
        score: { $meta: 'textScore' },
      }
    )
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ score: { $meta: 'textScore' } })
      .select('name avatar')
      .lean()
  }

  static getAllFriendsRequestUser = async ({ userId, page, limit }) => {
    const block = await getAllBlock(userId)
    const filter = {
      $and: [
        { friendsRequest: { $in: [userId] } },
        { friendsRequest: { $nin: block } },
      ],
    }
    return await findUsers({ filter, page, limit })
  }

  static getAllFriendsInvitedUser = async ({ userId, page, limit }) => {
    const block = await getAllBlock(userId)
    const filter = {
      $and: [
        { friendsInvited: { $in: [userId] } },
        { friendsInvited: { $nin: block } },
      ],
    }
    return await findUsers({ filter, page, limit })
  }

  static getUsersSuggest = async ({ userId, page, limit }) => {
    const user = await findUserById(userId)
    const filter = {
      _id: {
        $nin: [
          ...user?.friends,
          ...user?.friendsInvited,
          ...user?.friendsRequest,
          ...user?.userBlockYou,
          ...user?.userYouBlock,
          userId,
        ],
      },
    }
    return await findUsers({ filter, page, limit })
  }

  static sendRequestFriend = async ({ userId, friendId }) => {
    await checkUser(userId, friendId)
    const update = {
        $addToSet: { friendsRequest: friendId },
      },
      updateFriend = {
        $addToSet: { friendsInvited: userId },
      }
    const friend = await updateUserById({
      userId: friendId,
      update: updateFriend,
    })
    const user = await updateUserById({ userId, update: update })
    let content = 'vừa gửi cho bạn lời mời kết bạn.'
    await notificationProducer({
      sendId: userId,
      receiverIds: [friendId],
      type: 'friend',
      content,
      url: `/${user.name}/${user._id}`,
    })
    return { user, friend }
  }

  static unfriendUser = async ({ userId, friendId }) => {
    const update = {
        $pull: { friends: friendId },
      },
      updateFriend = {
        $pull: { friends: userId },
      }
    const friend = await updateUserById({
      userId: friendId,
      update: updateFriend,
    })
    const user = await updateUserById({ userId, update: update })
    await unFriendOrCancelNotification({
      senderId: userId,
      receiverId: friendId,
    })
    return { user, friend }
  }

  static cancelRequestFriend = async ({ userId, friendId }) => {
    const update = {
        $pull: { friendsRequest: friendId },
      },
      updateFriend = {
        $pull: { friendsInvited: userId },
      }
    const friend = await updateUserById({
      userId: friendId,
      update: updateFriend,
    })
    const user = await updateUserById({ userId, update: update })
    await unFriendOrCancelNotification({
      senderId: userId,
      receiverId: friendId,
    })
    return { user, friend }
  }

  static refuseInvitedFriend = async ({ userId, friendId }) => {
    const update = {
        $pull: { friendsInvited: friendId },
      },
      updateFriend = {
        $pull: { friendsRequest: userId },
      }
    const friend = await updateUserById({
      userId: friendId,
      update: updateFriend,
    })
    const user = await updateUserById({ userId, update: update })
    let content = 'đã từ chối lời mời kết bạn.'
    await notificationProducer({
      sendId: userId,
      receiverIds: [friendId],
      type: 'friend',
      content,
      url: `/${user.name}/${user._id}`,
    })
    return { user, friend }
  }

  static acceptInvitedFriend = async ({ userId, friendId, io }) => {
    const update = {
        $pull: { friendsInvited: friendId },
        $addToSet: { friends: friendId },
      },
      updateFriend = {
        $pull: { friendsRequest: userId },
        $addToSet: { friends: userId },
      }
    const friend = await updateUserById({
      userId: friendId,
      update: updateFriend,
    })
    const user = await updateUserById({ userId, update: update })
    let content = 'đã chấp nhận lời mời kết bạn.'
    await notificationProducer({
      sendId: userId,
      receiverIds: [friendId],
      type: 'friend',
      content,
      url: `/${user.name}/${user._id}`,
    })
    const conversation = await checkConversation({
      memberConversation: { $in: [userId, friendId] },
      type: 'single',
    })
    if (!conversation) {
      let newConversation = await Conversation.create({
        memberConversation: [userId, friendId],
        type: 'single',
      })
      await newConversation.populate('memberConversation', 'name avatar')
      io.to(userId).to(friendId).emit('New Conversation', newConversation)
    }
    return { user, friend }
  }

  static blockUser = async ({ userId, userBlockId }) => {
    const update = {
        $addToSet: { userYouBlock: userBlockId },
      },
      updateBlock = {
        $addToSet: { userBlockYou: userId },
      }

    const block = await updateUserById({
      userId: userBlockId,
      update: updateBlock,
    })
    const user = await updateUserById({ userId, update: update })
    return { user, block }
  }

  static unblockUser = async ({ userId, userBlockId }) => {
    const update = {
        $pull: { userYouBlock: userBlockId },
      },
      updateBlock = {
        $pull: { userBlockYou: userId },
      }
    const block = await updateUserById({
      userId: userBlockId,
      update: updateBlock,
    })
    const user = await updateUserById({ userId, update: update })
    return { user, block }
  }

  static getAllUserYouBlock = async ({ userId, page, limit }) => {
    const user = await findUserById(userId)
    const filter = {
      _id: { $in: user.userYouBlock },
    }
    return await findUsers({ filter, page, limit })
  }

  static getAllUserBlockYou = async ({ userId, page, limit }) => {
    const user = await findUserById(userId)
    const filter = {
      _id: { $in: user.userBlockYou },
    }
    return await findUsers({ filter, page, limit })
  }

  static getProfileUser = async ({ userId, profileId }) => {
    const user = await findUserById(userId)
    if (!user.userBlockYou.includes(profileId)) {
      return await findProfileUserById(profileId)
    }
    return { message: 'Không tim thấy người dùng này!' }
  }

  static getStatusConversation = async (conversations) => {
    for (let index = 0; index < conversations.length; index++) {
      const conversation = conversations[index]
      let statusConversatoon = await handleGetConversationStatus(
        conversation._id
      )
      const { memberConversation } = conversation
      for (let index = 0; index < memberConversation.length; index++) {
        const element = memberConversation[index]
        element['lastLogin'] = statusConversatoon[convertToString(element._id)]
      }
    }
    return conversations
  }

  static getStatusUser = async (UserIds) => {
    let data = []
    for (let index = 0; index < UserIds.length; index++) {
      const user = UserIds[index]
      let result = await handleGetUserStatus(user._id)
      data.push({ [user._id]: { ...result } })
    }
    return data
  }

  static changePasswordUser = async ({
    currentPassword,
    newPassword,
    confirmPassword,
    userId,
  }) => {
    const data = { currentPassword, newPassword, confirmPassword }
    const user = await findUserById(userId)
    if (Object.values(data).find((value) => value.length < 6)) {
      throw new BadRequestError('Mật khẩu phải từ 6 ký tự trở lên.')
    }
    if (
      currentPassword === confirmPassword ||
      currentPassword === newPassword
    ) {
      throw new BadRequestError(
        'Mật khẩu trùng nhau, vui lòng nhập mật khẩu bạn muốn thay đổi.'
      )
    }
    if (newPassword !== confirmPassword) {
      throw new BadRequestError('Mật khẩu chưa khớp.')
    }
    const comparePassword = await bcrypt.compare(currentPassword, user.password)
    if (!comparePassword) throw new BadRequestError('Mật khẩu không chính xác.')
    const salt = await bcrypt.genSalt(8)
    const hashPassword = await bcrypt.hash(newPassword, salt)
    const update = await User.updateOne(
      { _id: userId },
      {
        password: hashPassword,
      }
    )
    if (update.modifiedCount === 1) {
      return true
    } else {
      throw new BadRequestError('Đổi mật khẩu thất bại.')
    }
  }

  static createOtp = async ({ email }) => {
    const isExistOtp = await Otp.findOne({ email: email })
    if (isExistOtp) {
      throw new BadRequestError('Đã gửi mã đến Email này trước đó rồi.')
    }
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })
    return { otp: await OtpService.insertOtp({ otp, email }) }
  }

  static updateForgotPassword = async ({ newPassword, email, otp }) => {
    if (newPassword.length < 6)
      throw new BadRequestError('Mật khẩu phải từ 6 ký tự trở lên.')
    const isCorrectOtp = await OtpService.compareOtp({ email, otp })
    if (!isCorrectOtp) throw new BadRequestError('Mã xác nhận không chính xác.')
    const salt = await bcrypt.genSalt(10)
    const hasdPassword = await bcrypt.hash(newPassword, salt)
    const updatePassword = await User.updateOne(
      { email },
      {
        password: hasdPassword,
      }
    )
    if (updatePassword.modifiedCount) {
      await OtpService.deleteOtp(email)
    }
    return updatePassword.modifiedCount ? 1 : 0
  }

  static searchPostAndUser = async ({
    search,
    typeSearch = [],
    skip,
    limit,
  }) => {
    if (!search) throw new MissingData('Data')
    if (typeSearch.includes('user')) {
      let filter = { name: { $regex: search } }
      return await searchUser({ filter, limit, skip })
    } else if (typeSearch.includes('post')) {
      let filter = { name: { $regex: search } }
      return await searchPosts({ filter, limit, skip })
    }
  }
}

module.exports = UserService
