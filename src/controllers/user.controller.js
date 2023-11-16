const { SuccessResponse } = require('../core/success.response')
const UserService = require('../services/user.service')

class UserController {
  constructor() {
    this.io = global.io
  }

  getProfileUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get profile user success.',
      metadata: await UserService.getProfileUser({
        profileId: req.params.profileId,
        userId: req.user?._id,
      }),
    }).send(res)
  }

  getAllFriendsUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all friends success.',
      metadata: await UserService.getAllFriendsUser(req.body),
    }).send(res)
  }

  findFriendsByName = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all friends search success.',
      metadata: await UserService.findFriendsByName(req.body),
    }).send(res)
  }

  getAllFriendsRequestUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all friends request success.',
      metadata: await UserService.getAllFriendsRequestUser(req.body),
    }).send(res)
  }

  getAllFriendsInvitedUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all friends invited success.',
      metadata: await UserService.getAllFriendsInvitedUser(req.body),
    }).send(res)
  }

  getUsersSuggest = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all user suggest success.',
      metadata: await UserService.getUsersSuggest(req.body),
    }).send(res)
  }

  sendRequestFriend = async (req, res, next) => {
    try {
      const { userId, friendId } = req.body
      const { user, friend } = await UserService.sendRequestFriend(req.body)
      this.io.to(friendId).emit('request-friend', user)
      new SuccessResponse({
        message: 'Send friend request success.',
        metadata: friend,
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  unfriendUser = async (req, res, next) => {
    try {
      const { userId, friendId } = req.body
      const { user, friend } = await UserService.unfriendUser(req.body)
      this.io.to(friendId).emit('unfriend', user)
      new SuccessResponse({
        message: 'Unfriend success.',
        metadata: friend,
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  cancelRequestFriend = async (req, res, next) => {
    try {
      const { userId, friendId } = req.body
      const { user, friend } = await UserService.cancelRequestFriend(req.body)
      this.io.to(friendId).emit('cancel-invited-friend', user)
      new SuccessResponse({
        message: 'Cancel friend request success.',
        metadata: friend,
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  refuseInvitedFriend = async (req, res, next) => {
    try {
      const { userId, friendId } = req.body
      const { user, friend } = await UserService.refuseInvitedFriend(req.body)
      this.io.to(friendId).emit('refuse-invited-friend', user)
      new SuccessResponse({
        message: 'Refuse friend request success.',
        metadata: friend,
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  acceptInvitedFriend = async (req, res, next) => {
    try {
      const { userId, friendId } = req.body
      const { user, friend } = await UserService.acceptInvitedFriend({
        ...req.body,
        io: this.io,
      })
      this.io.to(friendId).emit('accept-invited-friend', user)
      new SuccessResponse({
        message: 'Accept invited friend success.',
        metadata: friend,
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  blockUser = async (req, res, next) => {
    try {
      const { user, block } = await UserService.blockUser(req.body)
      const { userId, blockId } = req.body
      this.io.to(blockId).emit('block-user', user)
      new SuccessResponse({
        message: 'Block user success.',
        metadata: block,
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  unblockUser = async (req, res, next) => {
    try {
      const { userId, blockId } = req.body
      const { user, block } = await UserService.unblockUser(req.body)
      this.io.to(blockId).emit('unblock-user', user)
      new SuccessResponse({
        message: 'Unblock user success.',
        metadata: block,
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getAllUserYouBlock = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all user you block success.',
      metadata: await UserService.getAllUserYouBlock(req.body),
    }).send(res)
  }

  getAllUserBlockYou = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all user block you success.',
      metadata: await UserService.getAllUserBlockYou(req.body),
    }).send(res)
  }

  getStatusConversation = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all status conversations success.',
      metadata: await UserService.getStatusConversation(req.body),
    }).send(res)
  }

  getStatusUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all status users success.',
      metadata: await UserService.getStatusUser(req.body),
    }).send(res)
  }
  changePasswordUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update password success.',
      metadata: await UserService.changePasswordUser(req.body),
    }).send(res)
  }

  createOtp = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create OTP success.',
      metadata: await UserService.createOtp(req.body),
    }).send(res)
  }

  updateForgotPassword = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update Password success.',
      metadata: await UserService.updateForgotPassword(req.body),
    }).send(res)
  }

  searchPostAndUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'Result search success.',
      metadata: await UserService.searchPostAndUser(req.body),
    }).send(res)
  }
}

module.exports = new UserController()
