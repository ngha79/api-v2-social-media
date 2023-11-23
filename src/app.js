const express = require('express')
const app = express()
const passport = require('passport')
const cors = require('cors')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const MongoDBStore = require('connect-mongodb-session')(session)
const http = require('http')
const socketIo = require('socket.io')
const socket = require('./helpers/socket')
const routes = require('./routes')
const { EventEmitter } = require('stream')
const useragent = require('express-useragent')
const {
  consumerToQueueNormal,
  consumerToQueueFailed,
} = require('./services/consumerQueue.service')

require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: '10Mb' }))

// init middlewares
require('./dbs/init.mongodb')
require('./passport')
app.use(cors())

app.use(useragent.express())
const store = new MongoDBStore({
  uri: 'mongodb://127.0.0.1:27017/social-media',
  collection: 'mySessions',
})

// Catch errors
store.on('error', function (error) {
  // console.log(error)
})
app.use(
  session({
    secret: 'imnotgivingawayprivateinformationinstackoverflow',
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: {
      secure: false, // set to true for production https
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 72 * 60 * 60 * 1000, // 3 days
    },
  })
)
app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())
const emitter = new EventEmitter()
emitter.setMaxListeners(100)
// or 0 to turn off the limit
emitter.setMaxListeners(0)
const server = http.createServer(app)
const io = socketIo(server)
global.io = io
require('../src/services/redis.service')

socket(io)
routes(app)

consumerToQueueNormal(io)
  .then((io) => {
    console.log('Message consumerToQueueNormal started ')
  })
  .catch((error) => {
    console.error(`Message Error: ${error.message}`)
  })

consumerToQueueFailed(io)
  .then((io) => {
    console.log('Message consumerToQueueFailed started ')
  })
  .catch((error) => {
    console.error(`Message Error: ${error.message}`)
  })

app.use((req, res, next) => {
  const error = new Error('Not Found!')
  error.status = 404
  next(error)
})

app.use((error, req, res, next) => {
  const statusCode = error.status || 500
  return res.status(statusCode).json({
    status: statusCode,
    message: error.message,
  })
})

module.exports = { app: server, io }
