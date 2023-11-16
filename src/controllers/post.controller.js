const { SuccessResponse } = require('../core/success.response')
const PostService = require('../services/post.service')

class PostController {
  constructor() {
    this.io = global.io
  }

  createPost = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new Post success',
      metadata: await PostService.createPost({ ...req.body, files: req.files }),
    }).send(res)
  }
  updatePost = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update Post success',
      metadata: await PostService.updatePost({ ...req.body, files: req.files }),
    }).send(res)
  }
  updateStatusPost = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update status Post success',
      metadata: await PostService.updateStatusPost(req.body),
    }).send(res)
  }
  deletePost = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete Post success',
      metadata: await PostService.deletePost(req.body),
    }).send(res)
  }
  likePost = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update likes Post success',
      metadata: await PostService.likePost(req.body),
    }).send(res)
  }
  sharePost = async (req, res, next) => {
    new SuccessResponse({
      message: 'Share Post success',
      metadata: await PostService.sharePost(req.body),
    }).send(res)
  }
  getPostByUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get Posts success',
      metadata: await PostService.getPostByUser(req.body),
    }).send(res)
  }
  getPostByProfile = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get Posts success',
      metadata: await PostService.getPostByProfile(req.body),
    }).send(res)
  }
  getPostById = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get Post success',
      metadata: await PostService.getPostById(req.params),
    }).send(res)
  }
}

module.exports = new PostController()
