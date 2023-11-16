const { authentication } = require('../../auth/authUtils')
const { asyncHandler } = require('../../auth/checkAuth')
const messageController = require('../../controllers/message.controller')
const uploadCloud = require('../../helpers/cloudinary.config')
const routes = require('express').Router()

routes.put(
  '/',
  authentication,
  asyncHandler(messageController.getMessageByConversationId)
)
routes.post(
  '/',
  uploadCloud.array('files'),
  authentication,
  asyncHandler(messageController.createNewMessage)
)
routes.put(
  '/delete',
  authentication,
  asyncHandler(messageController.deleteMessage)
)
routes.put(
  '/delete-me',
  authentication,
  asyncHandler(messageController.deleteMessageOnlyMe)
)
routes.put(
  '/react',
  authentication,
  asyncHandler(messageController.addReactionMessage)
)
routes.put(
  '/delete-all',
  authentication,
  asyncHandler(messageController.deleteAll)
)

module.exports = routes
