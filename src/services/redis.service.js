const { createClient } = require('redis')
require('dotenv').config()
const { REDIS_PASSWORD, REDIS_URL, REDIS_PORT } = process.env
const client = createClient({
  username: 'default', // needs Redis >= 6
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_URL,
    port: REDIS_PORT,
  },
})

client.on('error', (err) => {})
client.on('connect', () => {})
client.connect()

const handleSetUserStatus = async ({ userId, status, socketId }) => {
  if (!userId) return
  const info = await client.HGETALL(`user:${userId}`)
  let update = info.socketIds?.split(',')
  if (update?.[0] === '' || !update) update = []
  info['userId'] = userId
  if (status === 'online') {
    update = update.filter((id) => id !== socketId)
    update.push(socketId)
    info['socketIds'] = update.join(',')
  } else {
    update = update.filter((id) => id !== socketId)
    info['socketIds'] = update.join(',')
  }
  info['lastLogin'] = update.length > 0 ? 'null' : new Date().toString()
  return await client.hSet(`user:${userId}`, info)
}

const handleGetUserStatus = async (userId) => {
  return await client.hGetAll(`user:${userId}`)
}

const handleGetConversationStatus = async (conversationId) => {
  return await client.hGetAll(`conversation:${conversationId}`)
}

const handleSetConversationStatus = async (conversationId, userId) => {
  let check = await client.HGETALL(`conversation:${conversationId}`)
  let userStatus = await client.HGETALL(`user:${userId}`)
  if (!check) return null
  check[userId] = userStatus.lastLogin
  return await client.hSet(`conversation:${conversationId}`, check)
}

const handleOnCreateNewConversation = async (conversationId, members) => {
  let check = {}

  for (let index = 0; index < members.length; index++) {
    const element = members[index]
    let statusMember = await client.HGETALL(`user:${element}`)
    check[element] = statusMember.lastLogin
  }
  return await client.hSet(`conversation:${conversationId}`, check)
}

const handleUserOutConversation = async (conversationId, userId) => {
  return await client.HDEL(`conversation:${conversationId}`, userId)
}

const handleAddUserConversation = async (conversationId, userIds) => {
  let conversation = await client.HGETALL(`conversation:${conversationId}`)
  for (let index = 0; index < userIds.length; index++) {
    const element = userIds[index]
    let statusMember = await client.HGETALL(`user:${element}`)
    conversation[element] = statusMember.lastLogin
  }
  return await client.hSet(`conversation:${conversationId}`, conversation)
}

const handleOnDeleteConversation = async (conversationId) => {
  return await client.del(`conversation:${conversationId}`)
}

module.exports = {
  client,
  handleSetUserStatus,
  handleGetUserStatus,
  handleGetConversationStatus,
  handleSetConversationStatus,
  handleOnCreateNewConversation,
  handleOnDeleteConversation,
  handleUserOutConversation,
  handleAddUserConversation,
}
