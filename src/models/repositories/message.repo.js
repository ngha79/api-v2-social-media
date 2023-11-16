const { Message } = require('../message.model')

const getAllMessageByConversation = async ({
  conversationId,
  page = 1,
  limit = 20,
}) => {
  return Message.find({ conversationId: conversationId })
    .limit(limit)
    .skip(limit * (page - 1))
    .lean()
    .sort({ createdAt: -1 })
    .populate('userSendId', 'name avatar')
}

const getMessageById = async (id) => {
  return Message.findById(id).lean()
}

const updateMessage = async ({ filter, update, option = { new: true } }) => {
  return Message.findOneAndUpdate(filter, update, option).populate(
    'userSendId',
    'name avatar'
  )
}

module.exports = { getAllMessageByConversation, getMessageById, updateMessage }
