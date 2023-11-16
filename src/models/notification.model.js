const mongoose = require('mongoose') // Erase if already required

// Declare the Schema of the Mongo model
const DOCUMENT_NAME = 'Notification'
const COLLECTION_NAME = 'Notifications'

const notificationSchema = new mongoose.Schema(
  {
    noti_content: {
      type: String,
      require: true,
    },
    noti_senderId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      require: true,
    },
    noti_receiverId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      require: true,
    },
    noti_type: {
      type: String,
      enum: ['message', 'post', 'friend', 'room', 'reply', 'tag', 'like'],
      require: true,
    },
    noti_url: {
      type: String,
      require: true,
    },
    noti_options: {
      type: Object,
      default: {},
    },
    noti_isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
)

//Export the model
module.exports = {
  Notification: mongoose.model(DOCUMENT_NAME, notificationSchema),
}
