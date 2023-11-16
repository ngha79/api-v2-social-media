const mongoose = require('mongoose') // Erase if already required

// Declare the Schema of the Mongo model
const DOCUMENT_NAME = 'Message'
const COLLECTION_NAME = 'Messages'

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
    },
    images: {
      type: Array,
      default: [],
    },
    tags: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    userSendId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    conversationId: {
      type: mongoose.Types.ObjectId,
      ref: 'Conversation',
    },
    deletedUserIds: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    reacts: {
      type: [
        {
          userId: mongoose.Types.ObjectId,
          type: {
            type: Number,
            enum: [0, 1, 2, 3, 4, 5],
          },
        },
      ],
      default: [],
    },
    replyMessageId: {
      type: String,
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
)

//Export the model
module.exports = {
  Message: mongoose.model(DOCUMENT_NAME, messageSchema),
}
