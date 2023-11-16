const { Conversation } = require('../models/conversation.model')
const { User } = require('../models/user.model')
const {
  handleSetUserStatus,
  handleSetConversationStatus,
} = require('../services/redis.service')
const { convertToString } = require('../utils')

const socket = (io) => {
  io.on('connection', (socket) => {
    socket.on('connection', async () => {
      console.log('User connection', socket.id)
    })

    socket.on('login', async (userId) => {
      socket.join(userId)
      socket.userId = userId
      await handleSetUserStatus({
        userId,
        socketId: socket.id,
        status: 'online',
      })
    })

    socket.on('User Online Join Rooms', async (userId) => {
      const roomsUser = await Conversation.find({ memberConversation: userId })
      roomsUser?.forEach(async (room) => {
        socket.join(convertToString(room._id))
        await handleSetConversationStatus(
          convertToString(room._id),
          socket.userId
        )
      })

      socket.on('disconnect', async () => {
        await handleSetUserStatus({
          userId: socket.userId,
          socketId: socket.id,
          status: 'offline',
        })
        roomsUser?.forEach(async (room) => {
          // socket.to(room).emit('user offline', socket.userId)
          await handleSetConversationStatus(
            convertToString(room._id),
            socket.userId
          )
        })
      })

      socket.on('logout', async () => {
        await handleSetUserStatus({
          userId: socket.userId,
          status: 'offline',
          socketId: socket.id,
        })
        roomsUser?.forEach(async (room) => {
          socket.leave(room)
          await handleSetConversationStatus(room._id, socket.userId)
        })
      })
    })

    socket.on('join room', (room) => {
      socket.join(room._id)
    })

    socket.on('register-post', (postId) => {
      socket.join(postId)
    })

    socket.on('leave-post', (postId) => {
      socket.leave(postId)
    })

    socket.on('call video to rooms', ({ userId, roomId }) => {
      socket.broadcast
        .to(roomId)
        .emit('receiver video call', { userId, roomId })
    })

    socket.on('accept video call', ({ userId, roomId }) => {
      socket.to(userId).emit('accept video call to room', { userId, roomId })
    })

    socket.on('join room call', ({ userId, roomId }) => {
      socket.to(roomId).emit('start video call', { userId, roomId })
    })

    socket.on('refuse video call', (roomId) => {
      socket.broadcast.to(roomId).emit('refuse video call to room')
    })

    socket.on('cancel video call', (roomId) => {
      socket.broadcast.to(roomId).emit('cancel video call to room')
    })

    socket.on('start video call', ({ roomId, offer }) => {
      socket.broadcast
        .to(roomId)
        .emit('start video call to room', { roomId, offer })
    })

    socket.on('send video from user in room', ({ roomId, ans }) => {
      socket.broadcast
        .to(roomId)
        .emit('received video from user in room', { roomId, ans })
    })

    socket.on(
      'subscribe-call-video',
      ({ conversationId, newUserId, peerId }) => {
        socket.to(conversationId).emit('new-user-call', {
          conversationId,
          newUserId,
          peerId,
        })

        socket.on('disconnect', () => {
          socket.to(conversationId).emit('user-disconnected', newUserId)
        })
      }
    )
    socket.on('user-disconnected send', (userId, chatId) => {
      socket.to(chatId).emit('user-disconnected', userId)
    })

    socket.on('disconnect', async () => {
      console.log('User disconnect', socket.userId)
    })
  })
}

module.exports = socket
