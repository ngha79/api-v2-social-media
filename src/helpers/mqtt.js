const mqtt = require('mqtt')
const connectUrl =
  'wss://643151d6cd8e4e7dbcd01f3addba30f8.s1.eu.hivemq.cloud:8884/mqtt'

const client = mqtt.connect(connectUrl, {
  port: 8884,
  host: 'mqtt://643151d6cd8e4e7dbcd01f3addba30f8.s1.eu.hivemq.cloud:8884/mqtt',
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  username: 'test1',
  password: 'Hangu123',
  keepalive: 60,
  reconnectPeriod: 1000,
  protocolId: 'MQIsdp',
  protocolVersion: 3,
  clean: true,
  encoding: 'utf8',
})

client.on('connect', () => {
  client.subscribe('receivernewnotification', (err) => {
    if (err) console.error(err)
  })
})

client.on('message', (topic, message) => {
  // message is Buffer
})

module.exports = client
