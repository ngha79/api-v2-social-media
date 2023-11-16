const { authentication } = require('../../auth/authUtils')
const { asyncHandler } = require('../../auth/checkAuth')
const postController = require('../../controllers/post.controller')
const uploadCloud = require('../../helpers/cloudinary.config')
const routes = require('express').Router()

routes.post(
  '/',
  authentication,
  uploadCloud.array('images'),
  asyncHandler(postController.createPost)
)
routes.put(
  '/update',
  authentication,
  uploadCloud.array('files'),
  postController.updatePost
)
routes.put(
  '/update/status',
  authentication,
  asyncHandler(postController.updateStatusPost)
)
routes.delete('/', authentication, asyncHandler(postController.deletePost))
routes.put('/', authentication, asyncHandler(postController.likePost))
routes.post('/share', authentication, asyncHandler(postController.sharePost))
routes.post(
  '/posts',
  authentication,
  asyncHandler(postController.getPostByUser)
)
routes.post(
  '/posts/profile',
  authentication,
  asyncHandler(postController.getPostByProfile)
)
routes.get(
  '/get-detail/:postId',
  authentication,
  asyncHandler(postController.getPostById)
)

module.exports = routes
