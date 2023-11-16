const amqp = require('amqplib')
require('process').config()
const { RABBITMQ, RABBITMQ_PORT, RABBITMQ_USERNAME, RABBITMQ_PASSWORD } =
  process.env
const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect({
      port: RABBITMQ_PORT,
      hostname: RABBITMQ,
      username: RABBITMQ_USERNAME,
      password: RABBITMQ_PASSWORD,
      vhost: RABBITMQ_USERNAME,
    })

    if (!connection) throw new Error('Connection not established')

    const channel = await connection.createChannel()

    return { connection, channel }
  } catch (error) {
    console.error('Error connecting to RabbitMQ', error)
    throw error
  }
}

const connectToRabbitMQForTest = async () => {
  try {
    const { connection, channel } = await connectToRabbitMQ()

    const queue = 'test-queue'
    const message = 'Hello rabbitMQ'

    await channel.assertQueue(queue)
    await channel.sendToQueue(queue, Buffer.from(message))

    await connection.close()
  } catch (error) {
    console.error('Error connecting to RabbitMQ', error)
  }
}

const consumerQueue = async (channel, queueName) => {
  try {
    await channel.assertQueue(queueName, { durable: true })

    console.log('Watting for messages....')

    channel.consume(
      queueName,
      (msg) => {
        console.log('Receired message: ' + queueName, msg.content.toString())
      },
      { noAck: true }
    )
  } catch (error) {
    console.error('Error', error)
    throw error
  }
}

module.exports = {
  connectToRabbitMQ,
  connectToRabbitMQForTest,
  consumerQueue,
}
