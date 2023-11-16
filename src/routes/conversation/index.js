const { authentication } = require('../../auth/authUtils')
const { asyncHandler } = require('../../auth/checkAuth')
const conversationController = require('../../controllers/conversation.controller')
const uploadCloud = require('../../helpers/cloudinary.config')
const routes = require('express').Router()

routes.put(
  '/',
  authentication,
  asyncHandler(conversationController.getAllConversation)
)
routes.put(
  '/search',
  authentication,
  asyncHandler(conversationController.findConversationByName)
)
routes.put(
  '/find',
  authentication,
  asyncHandler(conversationController.findConversationByUser)
)
routes.post(
  '/',
  uploadCloud.single('avatar'),
  authentication,
  asyncHandler(conversationController.createConversation)
)
routes.put(
  '/add-member',
  authentication,
  asyncHandler(conversationController.addUserToConversation)
)
routes.put(
  '/accept',
  authentication,
  asyncHandler(conversationController.acceptToConversation)
)
routes.put(
  '/kick',
  authentication,
  asyncHandler(conversationController.kickMemberConversation)
)
routes.put(
  '/leave',
  authentication,
  asyncHandler(conversationController.leaveConversation)
)
routes.put(
  '/disband',
  authentication,
  asyncHandler(conversationController.disbandConversation)
)
routes.put(
  '/update',
  uploadCloud.single('avatar'),
  authentication,
  asyncHandler(conversationController.updateConversation)
)

module.exports = routes
