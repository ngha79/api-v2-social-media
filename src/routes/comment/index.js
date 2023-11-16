const { authentication } = require('../../auth/authUtils')
const { asyncHandler } = require('../../auth/checkAuth')
const CommentController = require('../../controllers/comment.controller')
const uploadCloud = require('../../helpers/cloudinary.config')
const routes = require('express').Router()

routes.post(
  '/',
  authentication,
  uploadCloud.array('files'),
  asyncHandler(CommentController.createComment)
)

routes.post(
  '/list',
  authentication,
  asyncHandler(CommentController.getCommentByParentId)
)

routes.get('/:postId', asyncHandler(CommentController.getCountCommentInPost))

routes.delete(
  '/:commentId/:userId',
  authentication,
  uploadCloud.array('files'),
  asyncHandler(CommentController.deleteComment)
)

routes.put(
  '/',
  authentication,
  uploadCloud.array('files'),
  asyncHandler(CommentController.updateComment)
)

routes.put('/like', authentication, asyncHandler(CommentController.likeComment))

module.exports = routes
