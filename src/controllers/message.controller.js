const { SuccessResponse, CREATED } = require('../core/success.response')
const MessageService = require('../services/message.service')

class MessageController {
  constructor() {
    this.io = global.io
  }
  createNewMessage = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new message success',
      metadata: await MessageService.createNewMessage({
        ...req.body,
        files: req.files,
        io: this.io,
      }),
    }).send(res)
  }

  getMessageByConversationId = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get messages success',
      metadata: await MessageService.getMessageByConversationId(req.body),
    }).send(res)
  }

  deleteMessage = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete message success',
      metadata: await MessageService.deleteMessage({
        ...req.body,
        io: this.io,
      }),
    }).send(res)
  }

  deleteMessageOnlyMe = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete message success',
      metadata: await MessageService.deleteMessageOnlyMe(req.body),
    }).send(res)
  }

  addReactionMessage = async (req, res, next) => {
    new SuccessResponse({
      message: 'Add react to message success',
      metadata: await MessageService.addReactionMessage({
        ...req.body,
        io: this.io,
      }),
    }).send(res)
  }

  deleteAll = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete all message success',
      metadata: await MessageService.deleteAll(req.body),
    }).send(res)
  }
}

module.exports = new MessageController()
