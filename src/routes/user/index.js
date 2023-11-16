const express = require('express')
const passport = require('passport')
const routes = express.Router()

const { asyncHandler } = require('../../auth/checkAuth')
const userController = require('../../controllers/user.controller')
const { authentication } = require('../../auth/authUtils')
const uploadCloud = require('../../helpers/cloudinary.config')

routes.get(
  '/profile/:profileId',
  authentication,
  asyncHandler(userController.getProfileUser)
)
routes.post(
  '/friends',
  authentication,
  asyncHandler(userController.getAllFriendsUser)
)
routes.post(
  '/friends/request',
  authentication,
  asyncHandler(userController.getAllFriendsRequestUser)
)
routes.post(
  '/friends/invited',
  authentication,
  asyncHandler(userController.getAllFriendsInvitedUser)
)
routes.post(
  '/friends/suggest',
  authentication,
  asyncHandler(userController.getUsersSuggest)
)
routes.put(
  '/send-request',
  authentication,
  asyncHandler(userController.sendRequestFriend)
)
routes.put(
  '/unfriend',
  authentication,
  asyncHandler(userController.unfriendUser)
)
routes.put(
  '/cancel-request',
  authentication,
  asyncHandler(userController.cancelRequestFriend)
)
routes.put(
  '/refuse-invited',
  authentication,
  asyncHandler(userController.refuseInvitedFriend)
)
routes.put(
  '/accept-invited',
  authentication,
  asyncHandler(userController.acceptInvitedFriend)
)
routes.put('/block', authentication, asyncHandler(userController.blockUser))
routes.put('/unblock', authentication, asyncHandler(userController.unblockUser))
routes.put(
  '/you/blocks',
  authentication,
  asyncHandler(userController.getAllUserYouBlock)
)
routes.put(
  '/you/blocked',
  authentication,
  asyncHandler(userController.getAllUserBlockYou)
)
routes.put(
  '/friend/search',
  authentication,
  asyncHandler(userController.findFriendsByName)
)
routes.put(
  '/status/conversations',
  asyncHandler(userController.getStatusConversation)
)
routes.put('/status/users', asyncHandler(userController.getStatusUser))
routes.post('/update/password', asyncHandler(userController.changePasswordUser))
routes.put('/create-otp', asyncHandler(userController.createOtp))
routes.put(
  '/update/fotgot-password',
  asyncHandler(userController.updateForgotPassword)
)
routes.put('/search/post-user', asyncHandler(userController.searchPostAndUser))

module.exports = routes
