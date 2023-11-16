const mongoose = require('mongoose') // Erase if already required

// Declare the Schema of the Mongo model
const DOCUMENT_NAME = 'Post'
const COLLECTION_NAME = 'Posts'

const postSchema = new mongoose.Schema(
  {
    text: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    like: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    share: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    postShare: {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
    },
    author: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    statusPost: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    typePost: {
      type: String,
      enum: ['public', 'private', 'friend', 'messages'],
      default: 'public',
    },
    type: {
      type: String,
      enum: ['post', 'share'],
      default: 'post',
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
)

postSchema.index({ text: 'text' })

//Export the model
module.exports = {
  Post: mongoose.model(DOCUMENT_NAME, postSchema),
}
