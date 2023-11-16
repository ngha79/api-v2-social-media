const bcrypt = require('bcrypt')
const _ = require('lodash')
const { Types } = require('mongoose')

const verifyPassword = async (userPassword, password) => {
  return await bcrypt.compare(userPassword, password)
}

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

const getIntoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields)
}

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]))
}

const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]))
}

const removeUndefinedObject = (obj) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] == null) {
      delete obj[k]
    }
  })
  return obj
}

const updateNestedObjectParser = (obj) => {
  const final = {}

  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      const response = updateNestedObjectParser(obj[k])
      Object.keys(response).forEach((a) => {
        final[`${k}.${a}`] = response[a]
      })
    } else {
      final[k] = obj[k]
    }
  })
  return final
}

const convertToObjectMongo = (id) => new Types.ObjectId(id)
const convertToString = (id) => id.toString()

const countProduct = async (cart) => {
  if (cart) {
    let { cart_products } = cart
    let total = cart_products.reduce((total, cart) => {
      return total + cart.quantity
    }, 0)
    cart.cart_count_product = total
    await cart.save()
    return cart
  }
}

module.exports = {
  getIntoData,
  getSelectData,
  unGetSelectData,
  removeUndefinedObject,
  updateNestedObjectParser,
  convertToObjectMongo,
  verifyPassword,
  hashPassword,
  countProduct,
  convertToString,
}
