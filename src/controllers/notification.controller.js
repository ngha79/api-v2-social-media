const { SuccessResponse } = require('../core/success.response')
const NotificationService = require('../services/notification.service')

class NotificationController {
  createNewNotification = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new Notification success',
      metadata: await NotificationService.createMessage(req.body),
    }).send(res)
  }

  listNotiByUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list Notification success',
      metadata: await NotificationService.listNotiByUser(req.body),
    }).send(res)
  }

  getNotification = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get Notification success',
      metadata: await NotificationService.getNotification(req.params),
    }).send(res)
  }
}

module.exports = new NotificationController()
