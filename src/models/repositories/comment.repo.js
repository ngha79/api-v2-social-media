const { Comment } = require('../comment.model')

const updateComment = async ({ update, filter, option = { new: true } }) => {
  return await Comment.findOneAndUpdate(filter, update, option)
    .lean()
    .populate('comment_userId', 'avatar name address')
    .populate('comment_user_replies', 'avatar name address')
}

const findCommentById = async ({ commentId }) => {
  return await Comment.findById(commentId)
    .populate('comment_userId', 'avatar name address')
    .populate('comment_user_replies', 'avatar name address')
}

const findComment = async ({ filter, limit, page }) => {
  return await Comment.find(filter)
    .limit(limit)
    .skip(limit * (page - 1))
    .sort({ createdAt: -1 })
    .populate('comment_userId', 'avatar name address')
    .populate('comment_user_replies', 'avatar name address')
}

module.exports = {
  updateComment,
  findCommentById,
  findComment,
}
