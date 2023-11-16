const amqplib = require('amqplib')

const messages = 'Hello rabbitmq ==)'

const runProducer = async () => {
  try {
    const connect = await amqplib.connect('amqp://guest:guest@localhost')

    const channel = await connect.createChannel()

    const queueName = 'test-topic'

    await channel.assertQueue(queueName, {
      durable: true,
    })

    channel.sendToQueue(queueName, Buffer.from(messages))

    console.log('messages send: ', messages)
  } catch (error) {
    console.error(error)
  }
}

runProducer().catch(console.error)
