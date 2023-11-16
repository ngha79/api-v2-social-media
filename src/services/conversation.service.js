const { Conversation } = require('../models/conversation.model')
const {
  updateConversation,
  findConversationById,
  findConversationsByUser,
  findOneConversation,
} = require('../models/repositories/conversation.repo')
const { convertToString } = require('../utils')
const {
  handleOnDeleteConversation,
  handleUserOutConversation,
  handleAddUserConversation,
  handleOnCreateNewConversation,
} = require('./redis.service')
const { getStatusConversation } = require('./user.service')

class ConversationService {
  static getAllConversation = async ({ userId, type, limit, skip }) => {
    let filter = {
      memberConversation: userId,
    }
    if (type) filter['type'] = type

    let conversations = await findConversationsByUser({ filter, limit, skip })
    return await getStatusConversation(conversations)
  }

  static findConversationByName = async ({ name, userId }) => {
    return await Conversation.find({ memberConversation: userId }).populate({
      path: 'memberConversation',
      match: { nameConversation: { $regex: name } },
    })
  }

  static findConversationByUser = async ({
    userId,
    friendId,
    conversationId,
  }) => {
    if (conversationId) {
      return await findOneConversation({
        _id: conversationId,
      })
    }
    return await findOneConversation({
      memberConversation: [userId, friendId],
      type: 'single',
    })
  }

  static createConversation = async ({
    leaderId,
    memberIds = [],
    name,
    avatar,
    file,
    io,
  }) => {
    if (file) {
      avatar = file.path
    }
    let newConversation = await Conversation.create({
      nameConversation: name,
      avatarConversation: avatar,
      leaderConversation: leaderId,
      memberConversation: memberIds,
    })
    if (newConversation) {
      memberIds.map((member) => {
        io.to(member).emit('create new conversation', newConversation)
      })
      await handleOnCreateNewConversation(
        convertToString(newConversation._id),
        memberIds
      )
    }
    return newConversation
  }

  static addUserToConversation = async ({ conversationId, userIds, io }) => {
    const filter = {
        _id: conversationId,
      },
      update = {
        $addToSet: { memberConversation: userIds },
      },
      option = {
        new: true,
      }

    let result = await updateConversation({ filter, update, option })
    if (result) {
      io.to(conversationId).emit('toAddUserToConversation', result, userIds)
      userIds.map((member) => {
        io.to(member).emit('onAddUserToConversation', result)
      })
      await handleAddUserConversation(conversationId, userIds)
    }
    return result
  }

  static acceptToConversation = async ({ conversationId, userId, io }) => {
    const filter = {
        _id: conversationId,
      },
      update = {
        $addToSet: { memberConversation: userId },
        $pull: { queueConversation: userId },
      },
      option = {
        new: true,
      }
    await handleAddUserConversation(conversationId, [userId])
    return await updateConversation({ filter, update, option })
  }

  static kickMemberConversation = async ({
    leaderId,
    userId,
    conversationId,
    io,
  }) => {
    const conversation = await findConversationById(conversationId)
    if (!conversation) {
      return {
        message: 'Nhóm chat không tồn tại!',
        status: 101,
      }
    }
    if (conversation.leaderConversation.toString() !== leaderId) {
      return {
        message: 'Bạn không thể thực hiện hành động này!',
        status: 101,
      }
    }
    if (
      !conversation.memberConversation.find(
        (user) => user._id.toString() === userId
      )
    ) {
      return {
        message: 'Nguời này không còn trong nhóm chat!',
        status: 102,
      }
    }
    const filter = {
        _id: conversationId,
      },
      update = {
        $pull: { memberConversation: userId },
      },
      option = {
        new: true,
      }
    let result = await updateConversation({ filter, update, option })
    io.to(conversationId).emit('kickMemberConversation', result, userId)
    io.to(userId).emit('toMemberKickConversation', result)
    await handleUserOutConversation(conversationId, userId)
    return result
  }

  static leaveConversation = async ({ userId, conversationId, io }) => {
    const conversation = await findConversationById(conversationId)
    if (!conversation) {
      return {
        message: 'Nhóm chat không tồn tại!',
        status: 101,
      }
    }
    const filter = {
        _id: conversationId,
      },
      update = {
        $pull: { memberConversation: userId },
      },
      option = {
        new: true,
      }
    let result = await updateConversation({ filter, update, option })
    io.to(conversationId).emit('leaveConversation', result)
    await handleUserOutConversation(conversationId, userId)
    return result
  }

  static disbandConversation = async ({ leaderId, conversationId, io }) => {
    const conversation = await findConversationById(conversationId)
    if (!conversation) {
      return {
        message: 'Nhóm chat không tồn tại!',
        status: 101,
      }
    }
    if (conversation.leaderConversation.toString() !== leaderId) {
      return {
        message: 'Bạn không thể thực hiện hành động này!',
        status: 101,
      }
    }
    let result = await Conversation.findByIdAndDelete(conversationId)
    io.to(conversationId).emit('disbandConversation', result)
    await handleOnDeleteConversation(conversationId)
    return result
  }

  static updateConversation = async ({
    conversationId,
    name,
    avatar,
    file,
    io,
  }) => {
    const filter = {
        _id: conversationId,
      },
      update = {
        name: name,
        avatar: file.path || avatar,
      },
      option = {
        new: true,
      }
    let result = await updateConversation({ filter, update, option })
    io.to(conversationId).emit('updateConversation', result)
    return result
  }
}

module.exports = ConversationService
