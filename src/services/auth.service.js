const crypto = require('crypto')
const bcrypt = require('bcrypt')
const KeyTokenService = require('../services/keytoken.service')
const { createTokenPair, verifyToken } = require('../auth/authUtils')
const {
  findUserById,
  findUserByEmail,
  updateProfile,
} = require('../models/repositories/user.repo')
const {
  ConflictRequestError,
  BadRequestError,
  ForbiddenError,
  AuthFailureError,
} = require('../core/error.response')
const { getIntoData } = require('../utils')
const { User } = require('../models/user.model')

const profileImage =
  'https://cdn-icons-png.flaticon.com/512/172/172163.png?w=826&t=st=1687709457~exp=1687710057~hmac=b6a0b4a5baeb4cea3943ce93fd600a81e12a6a4e81847cbdcd481659b87e49a3'

class AuthService {
  static handleRefreshToken = async (refreshToken) => {
    const foundToken = await KeyTokenService.findRefreshTokenUsed(refreshToken)
    if (foundToken) {
      const { _id, email } = await verifyToken(
        refreshToken,
        foundToken.privateKey
      )

      await KeyTokenService.deleteKeyById(_id)
      throw new ForbiddenError('Something wrong happen !! Please relogin.')
    }

    const holderToken = await KeyTokenService.findRefreshToken(refreshToken)
    if (!holderToken) throw new AuthFailureError('User not registered!')

    const { _id, email } = await verifyToken(
      refreshToken,
      holderToken.privateKey
    )

    const foundShop = await findUserByEmail(email)
    if (!foundShop) throw new AuthFailureError('User not registered!')

    const tokens = await KeyTokenService.createKeyToken(
      {
        _id,
        email,
      },
      holderToken.privateKey,
      holderToken.publicKey
    )

    const newToken = await createTokenPair(
      { _id, email },
      tokens.publicKey,
      tokens.privateKey
    )

    await KeyTokenService.findUserByEmailAndUpdate(_id, {
      $set: {
        refreshToken: newToken.refreshToken,
      },
      $addToSet: {
        refreshTokenUsed: refreshToken,
      },
    })

    return {
      user: { _id, email },
      tokens: newToken.accessToken,
    }
  }

  static authToken = async (user) => {
    const publicKey = crypto.randomBytes(64).toString('hex')
    const privateKey = crypto.randomBytes(64).toString('hex')
    const tokens = await createTokenPair(
      { _id: user._id, email: user.email },
      publicKey,
      privateKey
    )
    await KeyTokenService.createKeyToken({
      _id: user._id,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    })
    return tokens
  }

  static profileUser = async (userId) => {
    let user = null
    if (userId) {
      user = await findUserById(userId)
      user.password = null
    }
    return user
  }

  static signup = async ({ name, email, password }) => {
    try {
      const checkUser = await findUserByEmail(email)

      if (checkUser) throw new BadRequestError('User has been register!')

      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hashSync(password, salt)

      const newUser = await User.create({
        name,
        email,
        password: hash,
        picture: profileImage,
      })

      if (newUser) {
        const publicKey = crypto.randomBytes(64).toString('hex')
        const privateKey = crypto.randomBytes(64).toString('hex')
        const tokens = await createTokenPair(
          { _id: newUser._id, email },
          publicKey,
          privateKey
        )

        const keyStore = await KeyTokenService.createKeyToken({
          _id: newUser._id,
          privateKey,
          publicKey,
          refreshToken: tokens.refreshToken,
        })

        if (!keyStore)
          throw new ConflictRequestError(
            'Forbidden:: User already regsitered!',
            403
          )

        return {
          user: getIntoData({
            fields: [
              '_id',
              'email',
              'name',
              'avatar',
              'phoneNumber',
              'backgroundImage',
            ],
            object: newUser,
          }),
          tokens,
        }
      }
      return {
        code: 200,
        message: 'Error',
      }
    } catch (error) {
      return {
        code: 400,
        message: error.message,
        status: 'error',
      }
    }
  }

  static logout = async (keyStore) => {
    return await KeyTokenService.removeKeyById(keyStore._id)
  }

  static updateProfileUser = async (update, userId, files) => {
    files?.forEach((image) => {
      update[image.fieldname] = image.path
    })
    return await updateProfile(userId, update)
  }
}

module.exports = AuthService
