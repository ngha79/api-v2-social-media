const { User } = require('../user.model')

const findUserByEmail = async (email) => {
  return await User.findOne({ email: email }).lean()
}

const findUserById = async (userId) => {
  return await User.findById(userId).lean()
}

const findProfileUserById = async (userId) => {
  return await User.findById(userId)
    .lean()
    .select(
      '-email -password -friendsInvited -friendsRequest -userYouBlock -userBlockYou'
    )
    .populate('friends', 'avatar name')
}

const getAllBlock = async (userId) => {
  const user = await User.findById(userId).lean()
  return [...user.userBlockYou, ...user.userYouBlock]
}

const updateProfile = async (userId, update) => {
  return await User.findByIdAndUpdate(userId, update, { new: true })
    .lean()
    .select({ password: 0 })
}

const findUsers = async ({ filter, page = 1, limit = 50 }) => {
  const skip = (page - 1) * limit
  return await User.find(filter)
    .limit(limit)
    .skip(skip)
    .lean()
    .select('avatar name friends address')
}

const updateUserById = async ({ userId, update }) => {
  return await User.findByIdAndUpdate(userId, update, { new: true })
    .select('-password')
    .lean()
}

const checkUser = async (userId, userCheck) => {
  const user = await findUserById(userId)
  if (user?.userBlockYou.includes(userCheck)) {
    return {
      message: 'Không tìm thấy người dùng này',
    }
  }
  if (user?.userYouBlock.includes(userCheck)) {
    return {
      message: 'Bạn đang chặn người dùng này',
    }
  }
}

const searchUser = async ({ filter, limit, skip }) => {
  return await User.find(filter)
    .limit(limit)
    .skip(skip)
    .select('name avatar friends')
    .lean()
}

module.exports = {
  findUserByEmail,
  findUserById,
  updateProfile,
  updateUserById,
  findUsers,
  getAllBlock,
  checkUser,
  findProfileUserById,
  searchUser,
}
