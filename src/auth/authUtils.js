const jwt = require('jsonwebtoken')
// const KeyTokenService = require("../services/keytoken.service");
const { asyncHandler } = require('./checkAuth')
const {
  AuthFailureError,
  BadRequestError,
  TokenError,
  NotFoundError,
} = require('../core/error.response')
const KeyTokenService = require('../services/keytoken.service')

const HEADER = {
  APT_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
}

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await jwt.sign(payload, publicKey, {
      expiresIn: '2 days',
    })
    const refreshToken = await jwt.sign(payload, privateKey, {
      expiresIn: '7 days',
    })

    return {
      accessToken,
      refreshToken,
    }
  } catch (error) {
    return error
  }
}

const createAccessToken = async (payload, publicKey) => {
  try {
    const accessToken = await jwt.sign(payload, publicKey, {
      expiresIn: '2 days',
    })

    return accessToken
  } catch (error) {
    return error
  }
}

const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailureError('Invalid request!')
  const keyStore = await KeyTokenService.findByUserId(userId)
  if (!keyStore) throw new NotFoundError('Not Found!')
  const accessToken = req.cookies.accessToken
  if (!accessToken) throw new TokenError('Invalid request!')
  try {
    const decoded = await jwt.verify(accessToken, keyStore.publicKey)
    if (userId !== decoded._id) throw new TokenError('Invalid Userid!')
    req.keyStore = keyStore
    req.user = decoded
    next()
  } catch (error) {
    throw new TokenError(error)
  }
})

const verifyToken = async (token, secretKey) => {
  return jwt.verify(token, secretKey)
}

module.exports = {
  createTokenPair,
  verifyToken,
  authentication,
  createAccessToken,
}
