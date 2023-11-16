'use strict'

const { SuccessResponse } = require('../core/success.response')
const CommentService = require('../services/comment.service')

class CommentController {
  constructor() {
    this.io = global.io
  }

  createComment = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new comment success',
      metadata: await CommentService.createComment({
        ...req.body,
        files: req.files,
        io: this.io,
      }),
    }).send(res)
  }

  getCommentByParentId = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get comments success',
      metadata: await CommentService.getCommentByParentId({
        ...req.body,
      }),
    }).send(res)
  }

  deleteComment = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete comment success',
      metadata: await CommentService.deleteComment({
        ...req.params,
        io: this.io,
      }),
    }).send(res)
  }

  updateComment = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update comment success',
      metadata: await CommentService.updateComment({
        ...req.body,
        files: req.files,
        io: this.io,
      }),
    }).send(res)
  }

  getCountCommentInPost = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get CountComment In Post success',
      metadata: await CommentService.getCountCommentInPost({
        ...req.params,
      }),
    }).send(res)
  }

  likeComment = async (req, res, next) => {
    new SuccessResponse({
      message: 'Like comment success',
      metadata: await CommentService.likeComment({
        ...req.body,
      }),
    }).send(res)
  }
}

module.exports = new CommentController()
