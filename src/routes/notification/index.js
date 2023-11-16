const routes = require('express').Router()
const { authentication } = require('../../auth/authUtils')
const notificationController = require('../../controllers/notification.controller')

routes.post('/', authentication, notificationController.createNewNotification)
routes.post('/list', authentication, notificationController.listNotiByUser)
routes.get('/:notiId', authentication, notificationController.getNotification)

module.exports = routes
