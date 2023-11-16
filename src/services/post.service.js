const { MissingData, BadRequestError } = require('../core/error.response')
const { Post } = require('../models/post.model')
const {
  findPostById,
  updatePostById,
  deletePostById,
  findPosts,
} = require('../models/repositories/post.repo')
const { findUserById } = require('../models/repositories/user.repo')
const { notificationProducer } = require('../rabbitmq/producerDLX')
const { convertToObjectMongo, convertToString } = require('../utils')

class PostService {
  static createPost = async ({
    text,
    images = [],
    files = [],
    authorId,
    typePost,
  }) => {
    files.forEach((image) => images.push(image.path))
    if (!text && !images.length) {
      throw new MissingData('Bạn chưa nhập nội dung hoặc ảnh cho bài viết!')
    }
    let post = await Post.create({
      text,
      images,
      author: authorId,
      typePost,
    })
    const author = await findUserById(authorId)
    if (typePost !== 'private' && typePost !== 'messages') {
      let content = 'vừa tạo bài viết mới'
      await notificationProducer({
        sendId: authorId,
        receiverIds: author.friends,
        type: 'post',
        content,
        url: `/post/${post._id}`,
      })
    }
    return await post.populate('author', 'name avatar address')
  }

  static updatePost = async ({
    postId,
    text,
    files = [],
    images = [],
    statusPost,
    authorId,
    typePost,
  }) => {
    const post = await findPostById(postId)
    if (!post) throw BadRequestError('Bài viết không tồn tại!')
    if (authorId !== post.author._id.toString()) {
      throw new BadRequestError('Bạn không thể thực hiện hành động này!')
    }
    if (!text && !images.length && !files) {
      throw new MissingData('Bạn chưa nhập nội dung hoặc ảnh cho bài viết!')
    }
    let imagesUpload = []
    if (files) {
      files.forEach((image) => imagesUpload.push(image.path))
    }
    const update = {
      text: text,
      images: imagesUpload.concat(images),
      author: authorId,
      statusPost,
      typePost,
    }
    return await updatePostById(update, postId)
  }

  static updateStatusPost = async ({ postId, statusPost }) => {
    const post = await findPostById(postId)
    if (!post) throw new BadRequestError('Bài viết không tồn tại!')
    if (authorId !== post.author._id) {
      throw new BadRequestError('Bạn không thể thực hiện hành động này!')
    }
    const update = {
      statusPost,
    }
    return await updatePostById(update, postId)
  }

  static deletePost = async ({ postId, authorId }) => {
    const post = await findPostById(postId)
    if (!post) throw new BadRequestError('Bài viết không tồn tại!')
    if (authorId != post.author._id) {
      throw new BadRequestError('Bạn không thể thực hiện hành động này!')
    }
    return await deletePostById(postId)
  }

  static likePost = async ({ postId, userId, type = 'like' }) => {
    const post = await findPostById(postId)
    if (!post) throw new BadRequestError('Bài viết không tồn tại!')
    const update =
      type === 'like'
        ? { $addToSet: { like: userId } }
        : { $pull: { like: userId } }
    let { like } = post
    let totalLike = like.length
    if (
      like.find(
        (user) => convertToString(user) === convertToString(post.author._id)
      )
    ) {
      totalLike -= 1
    }
    if (userId !== convertToString(post.author._id) && type === 'like') {
      let content = `${
        totalLike > 0 ? `và ${totalLike} người khác` : ''
      } đã thích bài biết của bạn`
      await notificationProducer({
        sendId: userId,
        receiverIds: [convertToString(post.author._id)],
        type: 'like',
        content,
        url: `/post/${post._id}`,
      })
    }
    return await updatePostById(update, postId)
  }

  static sharePost = async ({ postId, userId, text, typePost = 'public' }) => {
    const post = await findPostById(postId)
    if (!post) throw new BadRequestError('Bài viết không tồn tại!')
    if (post.share.find((user) => user.toString() === userId)) {
      throw new BadRequestError('Bài viết này bạn đã chia sẻ!')
    }
    let newPost = await Post.create({
      text,
      author: userId,
      postShare: postId,
      typePost,
      type: 'share',
    })
    await newPost.populate([
      {
        path: 'postShare',
        select: 'text images',
        populate: [
          {
            path: 'author',
            select: 'name avatar address',
          },
        ],
      },
      {
        path: 'author',
        select: 'avatar address name',
      },
    ])
    const update = {
      $addToSet: {
        share: userId,
      },
    }
    let { share } = post
    let lengthShare = share.length
    if (
      post.share.find(
        (user) => convertToString(user) === convertToString(post.author._id)
      )
    ) {
      lengthShare -= 1
    }
    if (userId !== convertToString(post.author._id)) {
      let content = `${
        lengthShare > 0 ? `và ${lengthShare} người khác` : ''
      } đã chia sẻ bài biết của bạn`
      await notificationProducer({
        sendId: userId,
        receiverIds: [convertToString(post.author._id)],
        type: 'like',
        content,
        url: `/post/${post._id}`,
      })
    }
    await updatePostById(update, postId)
    return newPost
  }

  //   static updatePostShare = async ({
  //     postId,
  //     userId,
  //     statusPost = 'Active',
  //     text,
  //     typePost = 'public',
  //   }) => {
  //     const post = await findPostById(postId)
  //     if (!post) throw BadRequestError('Bài viết không tồn tại!')

  //     const update = {
  //       text,
  //       author: userId,
  //       postShare: postId,
  //       typePost,
  //       statusPost,
  //     }
  //     return await updatePostById(update, postId)
  //   }

  static getPostByUser = async ({ userId, limit, page, sort }) => {
    const user = await findUserById(userId)
    let block = [...user?.userBlockYou, ...user?.userYouBlock]
    const filter = {
      $and: [
        { author: { $in: [...user?.friends, user?._id] } },
        { author: { $nin: block } },
      ],
    }
    return await findPosts({ filter, limit, page, sort })
  }

  static getPostByProfile = async ({ userId, limit, page, sort }) => {
    const filter = {
      author: userId,
    }
    return await findPosts({ filter, limit, page, sort })
  }

  static getPostById = async ({ postId }) => {
    return await findPostById(postId)
  }
}

module.exports = PostService
