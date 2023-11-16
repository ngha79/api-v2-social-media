const { Post } = require('../post.model')

module.exports = {
  findPostById: async (postId) => {
    return await Post.findById(postId)
      .lean()
      .populate('author', 'avatar address name')
      .populate({
        path: 'postShare',
        select: 'text images',
        populate: [
          {
            path: 'author',
            select: 'name avatar',
          },
        ],
      })
  },
  updatePostById: async (update, postId) => {
    return await Post.findByIdAndUpdate(postId, update, { new: true })
      .populate('author', 'avatar address name')
      .populate({
        path: 'postShare',
        select: 'text images',
        populate: [
          {
            path: 'author',
            select: 'name avatar',
          },
        ],
      })
      .lean()
  },
  deletePostById: async (postId) => {
    return await Post.findByIdAndDelete(postId)
  },
  findPosts: async ({ filter, page = 1, limit = 20, sort }) => {
    let skip = limit * (page - 1)
    return await Post.find(filter)
      .limit(limit)
      .skip(skip)
      .lean()
      .populate('author', 'avatar address name')
      .populate({
        path: 'postShare',
        select: 'text images',
        populate: [
          {
            path: 'author',
            select: 'name avatar',
          },
        ],
      })
      .sort({ createdAt: -1 })
  },
  searchPosts: async ({ filter, limit, skip }) => {
    return await Post.find(filter)
      .limit(limit)
      .skip(skip)
      .populate({
        path: 'postShare',
        select: 'text images',
        populate: [
          {
            path: 'author',
            select: 'name avatar',
          },
        ],
      })
      .lean()
  },
}
