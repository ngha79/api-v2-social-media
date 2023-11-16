const { BadRequestError } = require('../core/error.response')
const { Conversation } = require('../models/conversation.model')
const { Message } = require('../models/message.model')
const {
  updateConversation,
  findConversationsByUser,
  findConversation,
} = require('../models/repositories/conversation.repo')
const {
  getAllMessageByConversation,
  getMessageById,
  updateMessage,
} = require('../models/repositories/message.repo')
const { convertToObjectMongo, convertToString } = require('../utils')
class MessageService {
  static createNewMessage = async ({
    conversationId,
    userSend,
    userReceiver,
    text,
    images = [],
    files = [],
    tags = [],
    replyMessageId,
    io,
  }) => {
    let newMessage, conversation
    if (files) {
      images = files.map((file) => file.path)
    }
    if (!conversationId && userReceiver) {
      conversation = await findConversation({
        memberConversation: [userSend, userReceiver],
        type: 'single',
      })
      if (!conversation) {
        conversation = await Conversation.create({
          memberConversation: [userSend, userReceiver],
          isJoinFromLink: false,
          type: 'single',
        })
        await conversation.populate('memberConversation', 'name avatar')
        io.to(userReceiver).emit('New Conversation', conversation)
        io.to(userSend).emit('Join New Conversation', conversation)
      }
    }
    newMessage = await Message.create({
      userSendId: userSend,
      conversationId: conversationId || conversation?._id,
      text: text,
      images: images || [],
      tags: tags || [],
      replyMessageId: replyMessageId,
    })
    conversation = await this.updateLastMessageConversation({
      conversationId: conversationId || conversation?._id,
      messageId: newMessage._id,
    })
    await newMessage.populate('userSendId', 'name avatar')
    io.to(convertToString(conversation?._id)).emit('createNewMessage', {
      newMessage,
      conversation,
    })
    return { newMessage, conversation }
  }

  static getMessageByConversationId = async ({
    conversationId,
    page,
    limit,
  }) => {
    return await getAllMessageByConversation({ conversationId, page, limit })
  }

  static updateLastMessageConversation = async ({
    conversationId,
    messageId,
    io,
  }) => {
    let update = {
        lastMessage: messageId,
      },
      filter = { _id: convertToObjectMongo(conversationId) }
    return await updateConversation({ filter, update })
  }

  static deleteMessage = async ({ messageId, userId, io }) => {
    const message = await getMessageById(messageId)
    if (userId !== message.userSendId.toString())
      throw new BadRequestError('Bạn không thể làm điều này!')
    let filter = {
        _id: messageId,
      },
      update = { isDeleted: true }
    let result = await updateMessage({ filter, update })
    io.to(result.conversationId + '').emit('deleteMessage', result)
    return result
  }

  static deleteMessageOnlyMe = async ({ messageId, userId }) => {
    const message = await getMessageById(messageId)
    if (message.isDeleted) return
    let filter = {
        _id: messageId,
      },
      update = {
        $addToSet: {
          deletedUserIds: userId,
        },
      }
    return await updateMessage({ filter, update })
  }

  static addReactionMessage = async ({ messageId, userId, type, io }) => {
    const message = await getMessageById(messageId)
    if (message.isDeleted || message.deletedUserIds.includes(userId))
      throw new BadRequestError('Tin nhắn đã xóa!')
    const reactIndex = message.reacts.find(
      (react) => react.userId.toString() === userId
    )
    let update,
      filter = {
        _id: messageId,
      }
    if (!reactIndex) {
      update = {
        $addToSet: {
          reacts: {
            userId: userId,
            type: type,
          },
        },
      }
    } else if (reactIndex.type !== type) {
      update = {
        $set: {
          reacts: {
            userId: userId,
            type: type,
          },
        },
      }
    } else {
      update = {
        $pull: {
          reacts: {
            userId: userId,
            type: type,
          },
        },
      }
    }

    let result = await updateMessage({ filter, update })
    io.to(result.conversationId + '').emit('addReactMessage', result)
    return result
  }

  static deleteAll = async ({ conversationId, userId }) => {
    await Message.updateMany(
      { conversationId, deletedUserIds: { $nin: [userId] } },
      { $addToSet: { deletedUserIds: userId } }
    ).then()
  }
}

module.exports = MessageService
