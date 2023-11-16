const mongoose = require('mongoose') // Erase if already required

// Declare the Schema of the Mongo model
const DOCUMENT_NAME = 'Conversation'
const COLLECTION_NAME = 'Conversations'

const conversationSchema = new mongoose.Schema(
  {
    memberConversation: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    leaderConversation: { type: mongoose.Types.ObjectId, ref: 'User' },
    queueConversation: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    nameConversation: {
      type: String,
    },
    avatarConversation: {
      type: String,
    },
    lastMessage: { type: mongoose.Types.ObjectId, ref: 'Message' },
    isJoinFromLink: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ['group', 'single'],
      default: 'group',
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
)

//Export the model
module.exports = {
  Conversation: mongoose.model(DOCUMENT_NAME, conversationSchema),
}
