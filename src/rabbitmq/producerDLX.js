const amqplib = require('amqplib')

const notificationProducer = async (message) => {
  try {
    const connect = await amqplib.connect('amqp://guest:guest@localhost')

    const channel = await connect.createChannel()

    const notificationExchange = 'notificationEx'
    const notiQueue = 'notificationQueueProcess'
    const notificationExchangeDLX = 'notificationExchangeDLX'
    const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX'

    await channel.assertExchange(notificationExchange, 'direct', {
      durable: true,
    })

    const queueResult = await channel.assertQueue(notiQueue, {
      exclusive: false,
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX,
    })

    await channel.bindQueue(queueResult.queue, notificationExchange)

    console.log(`producer msg:: `, message)

    const { sendId, receiverIds, type, content, url } = message

    if (receiverIds.length > 0) {
      for (let i = 0; i < receiverIds.length; i++) {
        channel.sendToQueue(
          queueResult.queue,
          Buffer.from(
            JSON.stringify({
              sendId,
              receiverId: receiverIds[i],
              type,
              content,
              url,
            })
          ),
          {
            expiration: '1000',
          }
        )
      }
    }

    setTimeout(() => {
      connect.close()
    }, 500)
  } catch (error) {
    console.error(error)
    throw error
  }
}

module.exports = { notificationProducer }
