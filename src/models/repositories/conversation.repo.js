const { Conversation } = require('../conversation.model')

const findConversationById = async (conversationId) => {
  return await Conversation.findById(conversationId).lean()
}

const findConversation = async (filter) => {
  return await Conversation.findOne(filter)
}

const findOneConversation = async (filter) => {
  return await Conversation.findOne(filter)
    .populate('memberConversation', 'name avatar')
    .populate({
      path: 'lastMessage',
      select: 'text images createdAt isDeleted',
      populate: [
        {
          path: 'userSendId',
          select: 'name avatar',
        },
      ],
    })
}

const findConversationsByUser = async ({ filter, limit = 20, skip = 0 }) => {
  return await Conversation.find(filter)
    .populate('memberConversation', 'name avatar')
    .populate({
      path: 'lastMessage',
      select: 'text images createdAt isDeleted',
      populate: [
        {
          path: 'userSendId',
          select: 'name avatar',
        },
      ],
    })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean()
}

const updateConversation = async ({
  update,
  filter,
  option = { new: true },
}) => {
  return await Conversation.findOneAndUpdate(filter, update, option)
    .lean()
    .populate('memberConversation', 'name avatar')
    .populate({
      path: 'lastMessage',
      select: 'text images createdAt isDeleted',
      populate: [
        {
          path: 'userSendId',
          select: 'name avatar',
        },
      ],
    })
}

const checkConversation = async (filter) => {
  return await Conversation.findOne(filter)
}

module.exports = {
  updateConversation,
  findConversationById,
  findConversationsByUser,
  checkConversation,
  findConversation,
  findOneConversation,
}
