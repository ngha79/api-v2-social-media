const mongoose = require('mongoose') // Erase if already required

// Declare the Schema of the Mongo model
const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'Users'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      default:
        'https://res.cloudinary.com/dlzulba2u/image/upload/v1694286071/shopDEV/user_vzpksu.png',
    },
    backgroundImage: {
      type: String,
    },
    authId: {
      type: String,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male',
    },
    address: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    dateOfBirdth: {
      type: String,
    },
    story: {
      type: String,
    },
    workplace: {
      type: String,
    },
    education: {
      type: String,
    },
    residence: {
      type: String,
    },
    password: {
      type: String,
    },
    authId: {
      type: String,
    },
    following: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    follower: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    friends: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    friendsInvited: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    friendsRequest: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    userYouBlock: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    userBlockYou: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true, collection: COLLECTION_NAME }
)

userSchema.index({ name: 'text' })

//Export the model
module.exports = {
  User: mongoose.model(DOCUMENT_NAME, userSchema),
}
