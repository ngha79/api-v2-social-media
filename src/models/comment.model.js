const mongoose = require('mongoose') // Erase if already required

// Declare the Schema of the Mongo model
const DOCUMENT_NAME = 'Comment'
const COLLECTION_NAME = 'Comments'

const commentSchema = new mongoose.Schema(
  {
    comment_postId: {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
    },
    comment_userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    comment_content: {
      type: String,
    },
    comment_images: [
      {
        type: String,
      },
    ],
    comment_user_replies: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    comment_parentId: {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
    },
    comment_likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    comment_child: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
)

//Export the model
module.exports = {
  Comment: mongoose.model(DOCUMENT_NAME, commentSchema),
}
