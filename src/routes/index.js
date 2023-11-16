const routes = (app) => {
  const auth = require('./auth')
  const user = require('./user')
  const post = require('./post')
  const conversation = require('./conversation')
  const message = require('./message')
  const comment = require('./comment')
  const notification = require('./notification')
  app.use('/api/v1/auth', auth)
  app.use('/api/v1/user', user)
  app.use('/api/v1/post', post)
  app.use('/api/v1/conversation', conversation)
  app.use('/api/v1/message', message)
  app.use('/api/v1/comment', comment)
  app.use('/api/v1/notification', notification)
}

module.exports = routes
