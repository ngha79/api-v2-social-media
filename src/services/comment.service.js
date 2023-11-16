'use strict'

const { NotFoundError, BadRequestError } = require('../core/error.response')
const { Comment } = require('../models/comment.model')
const {
  updateComment,
  findCommentById,
  findComment,
} = require('../models/repositories/comment.repo')
const { findPostById } = require('../models/repositories/post.repo')
const { getAllBlock } = require('../models/repositories/user.repo')
const { notificationProducer } = require('../rabbitmq/producerDLX')
const { convertToString } = require('../utils')

class CommentService {
  static async createComment({
    postId,
    userId,
    text,
    files = [],
    images = [],
    repliesUser,
    parentCommentId = null,
    io,
  }) {
    const post = await findPostById(postId)
    if (files) {
      images = files.map((file) => file.path)
    }
    const comment = new Comment({
      comment_postId: postId,
      comment_userId: userId,
      comment_content: text,
      comment_images: images,
      comment_user_replies: repliesUser,
      comment_parentId: parentCommentId,
    })

    if (parentCommentId) {
      const parentComment = await Comment.findByIdAndUpdate(parentCommentId, {
        $addToSet: { comment_user_replies: repliesUser },
        $addToSet: { comment_child: comment._id },
      })
      if (!parentComment) throw new NotFoundError('Comment not found!')
    }
    await comment.populate('comment_userId', 'avatar name address')
    await comment.populate('comment_user_replies', 'avatar name address')
    await comment.save()
    if (userId !== convertToString(post.author._id)) {
      let content = `đã bình luận vào bài viết của bạn.`
      await notificationProducer({
        sendId: userId,
        receiverIds: [convertToString(post.author._id)],
        type: 'comment',
        content,
        url: `/post/${postId}`,
      })
    }
    if (repliesUser && userId !== repliesUser) {
      let content = `đã nhắc đến bạn trong 1 bài viết.`
      await notificationProducer({
        sendId: userId,
        receiverIds: [repliesUser],
        type: 'reply',
        content,
        url: `/post/${postId}`,
      })
    }
    io.to(postId).emit('createNewComment', comment)
    return comment
  }

  static async getCommentByParentId({
    postId,
    parentCommentId = null,
    limit = 40,
    page = 1,
    userId,
  }) {
    let filter
    const userBlock = await getAllBlock(userId)
    parentCommentId
      ? (filter = {
          comment_parentId: parentCommentId,
          comment_userId: { $nin: userBlock },
        })
      : (filter = {
          comment_postId: postId,
          comment_parentId: parentCommentId,
          comment_userId: { $nin: userBlock },
        })

    return await findComment({ filter, limit, page })
  }

  static async deleteComment({ commentId, userId, io }) {
    const comment = await findCommentById({ commentId })
    if (!comment) throw new NotFoundError('Comment not found!')
    if (comment.comment_userId._id.toString() !== userId)
      throw new BadRequestError("Don't access!")

    comment.isDeleted = true
    await comment.save()
    await Comment.updateMany(
      {
        comment_parentId: commentId,
      },
      { isDeleted: true }
    )
    io.to(convertToString(comment.comment_postId)).emit(
      'deleteComment',
      comment
    )
    return comment
  }

  static async updateComment({
    commentId,
    userId,
    text,
    images = [],
    files = [],
  }) {
    const comment = await findCommentById({ commentId })
    if (!comment) throw new NotFoundError('Comment not found!')
    if (comment.comment_userId.toString() !== userId)
      throw new BadRequestError("Don't access!")
    if (files.length) {
      files.forEach((image) => images.push(image.path))
    }
    const filter = {
        _id: commentId,
      },
      update = {
        comment_images: images,
        comment_content: text,
      }

    let newUpdateComment = await updateComment({ filter, update })

    io.to(convertToString(comment.comment_postId)).emit(
      'updateComment',
      newUpdateComment
    )
    return newUpdateComment
  }

  static async deleteAllWhenPostDelete({ postId }) {
    return await Comment.deleteMany({
      comment_postId: postId,
    })
  }

  static async getCountCommentInPost({ postId }) {
    let totalCommentParent = await Comment.find({
      comment_postId: postId,
      comment_parentId: null,
    }).count()
    let totalComment = await Comment.find({
      comment_postId: postId,
    }).count()
    return {
      totalCommentParent,
      totalComment,
    }
  }

  static async likeComment({ commentId, userId }) {
    const comment = await findCommentById({ commentId })
    if (!comment) throw new NotFoundError('Comment not found!')

    let update,
      filter = { _id: commentId }
    if (
      comment?.comment_likes?.find((likeId) => likeId.toString() === userId)
    ) {
      update = {
        $pull: { comment_likes: userId },
      }
    } else {
      update = {
        $addToSet: { comment_likes: userId },
      }
      if (userId !== convertToString(comment.comment_userId._id)) {
        let totalLike = comment?.comment_likes.length
        let content = `${
          totalLike > 0 ? `và ${totalLike} người khác` : ''
        } đã thích bình luận của bạn`
        await notificationProducer({
          sendId: userId,
          receiverIds: [convertToString(comment.comment_userId._id)],
          type: 'like',
          content,
          url: `/post/${comment.comment_postId}`,
        })
      }
    }

    return await updateComment({ update, filter })
  }
}

module.exports = CommentService
