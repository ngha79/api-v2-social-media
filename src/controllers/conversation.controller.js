const { SuccessResponse } = require('../core/success.response')
const ConversationService = require('../services/conversation.service')

class ConversationController {
  constructor() {
    this.io = global.io
  }

  getAllConversation = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all conversation success.',
      metadata: await ConversationService.getAllConversation({
        ...req.body,
      }),
    }).send(res)
  }

  findConversationByName = async (req, res, next) => {
    new SuccessResponse({
      message: 'Find conversation success.',
      metadata: await ConversationService.findConversationByName({
        ...req.body,
      }),
    }).send(res)
  }

  findConversationByUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'Find conversation success.',
      metadata: await ConversationService.findConversationByUser({
        ...req.body,
      }),
    }).send(res)
  }

  createConversation = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new conversation success.',
      metadata: await ConversationService.createConversation({
        ...req.body,
        io: this.io,
        file: req.file,
      }),
    }).send(res)
  }
  addUserToConversation = async (req, res, next) => {
    new SuccessResponse({
      message: 'Add new user to conversation success.',
      metadata: await ConversationService.addUserToConversation({
        ...req.body,
        io: this.io,
      }),
    }).send(res)
  }
  acceptToConversation = async (req, res, next) => {
    new SuccessResponse({
      message: 'Accept join conversation success.',
      metadata: await ConversationService.acceptToConversation({
        ...req.body,
        io: this.io,
      }),
    }).send(res)
  }
  kickMemberConversation = async (req, res, next) => {
    new SuccessResponse({
      message: 'Kick member in conversation success.',
      metadata: await ConversationService.kickMemberConversation({
        ...req.body,
        io: this.io,
      }),
    }).send(res)
  }
  leaveConversation = async (req, res, next) => {
    new SuccessResponse({
      message: 'Leave conversation success.',
      metadata: await ConversationService.leaveConversation({
        ...req.body,
        io: this.io,
      }),
    }).send(res)
  }
  disbandConversation = async (req, res, next) => {
    new SuccessResponse({
      message: 'Disband conversation success.',
      metadata: await ConversationService.disbandConversation({
        ...req.body,
        io: this.io,
      }),
    }).send(res)
  }
  updateConversation = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update conversation success.',
      metadata: await ConversationService.updateConversation({
        ...req.body,
        file: req.file,
        io: this.io,
      }),
    }).send(res)
  }
}

module.exports = new ConversationController()
