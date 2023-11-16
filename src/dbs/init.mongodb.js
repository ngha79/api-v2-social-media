'use strict'

const { default: mongoose } = require('mongoose')
const connectDatabaseString = process.env.MONGODB_URL
const { countConnect } = require('../helpers/check.connect')
class Database {
  constructor() {
    this.connect()
  }

  connect(type = 'mongodb') {
    // if (1 === 1) {
    //   mongoose.set('debug', true)
    //   mongoose.set('debug', { color: true })
    // }
    mongoose
      .connect(connectDatabaseString)
      .then(() => console.log(`Connect to database success, ${countConnect()}`))
      .catch((err) => console.log(`Connect to database Error`))
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }
}

const instanceMongodb = Database.getInstance()

module.exports = instanceMongodb
