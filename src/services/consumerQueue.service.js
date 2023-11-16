const { connectToRabbitMQ, consumerQueue } = require('../dbs/init.rabbit')
const NotificationService = require('./notification.service')

const messageService = {
  consumerToQueue: async (queueName) => {
    try {
      const { channel, connection } = await connectToRabbitMQ()
      await consumerQueue(channel, queueName)
    } catch (error) {
      console.error('Error consumerToQueue::', error)
      throw error
    }
  },

  consumerToQueueNormal: async (io) => {
    try {
      const { channel, connection } = await connectToRabbitMQ()

      const notiQueue = 'notificationQueueProcess'

      channel.consume(notiQueue, async (msg) => {
        try {
          const data = JSON.parse(msg.content.toString())
          if (!data) throw new Error('Error')
          let newNotification = await NotificationService.createMessageNoti(
            data
          )
          if (!newNotification) throw new Error('Error')
          channel.ack(msg)
          io.to(newNotification.noti_receiverId.toString()).emit(
            'notification',
            newNotification
          )
        } catch (error) {
          channel.nack(msg, false, false)
        }
      })
    } catch (error) {
      console.error('error', error.message)
    }
  },

  consumerToQueueFailed: async (io) => {
    try {
      const { channel, connection } = await connectToRabbitMQ()

      const notificationExchangeDLX = 'notificationExchangeDLX'
      const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX'

      const notificationQueueHandler = 'notificationHandlerFailed'
      await channel.assertExchange(notificationExchangeDLX, 'direct', {
        durable: true,
      })

      const queueResult = await channel.assertQueue(notificationQueueHandler, {
        exclusive: false,
      })
      await channel.bindQueue(
        queueResult.queue,
        notificationExchangeDLX,
        notificationRoutingKeyDLX
      )
      await channel.consume(
        queueResult.queue,
        async (msgFailed) => {
          const data = JSON.parse(msgFailed.content.toString())
          if (!data) throw new Error('Missing data in request!')
          let newNotification = await NotificationService.createMessageNoti(
            data
          )
          if (!newNotification) throw new Error(msgFailed)
          else {
            io.to(newNotification.noti_receiverId.toString()).emit(
              'notification',
              newNotification
            )
          }
        },
        { noAck: true }
      )
    } catch (error) {
      console.error(error.message)
      throw error
    }
  },
}

module.exports = messageService
