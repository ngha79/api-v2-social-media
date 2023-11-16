'use strict'

const keytokenModel = require('../models/keytoken.model')

class KeyTokenService {
  static createKeyToken = async ({
    _id,
    privateKey,
    publicKey,
    refreshToken,
  }) => {
    try {
      // const tokens = await keytokenModel.create({
      //   user: userId,
      //   privateKey,
      //   publicKey,
      // });
      const filter = { user: _id },
        update = {
          publicKey,
          privateKey,
          refreshTokenUsed: [],
          refreshToken,
        },
        options = { upsert: true, new: true }
      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      )

      return tokens ? tokens : null
    } catch (error) {
      return error
    }
  }

  static findByUserId = async (userId) => {
    return await keytokenModel.findOne({ user: userId }).lean()
  }

  static findRefreshTokenUsed = async (refreshToken) => {
    return await keytokenModel
      .findOne({ refreshTokenUsed: refreshToken })
      .lean()
  }

  static findUserByEmailAndUpdate = async (userId, update) => {
    return await keytokenModel
      .findOneAndUpdate({ _id: userId }, update, {
        new: true,
      })
      .lean()
  }

  static findRefreshToken = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshToken: refreshToken }).lean()
  }

  static removeKeyById = async (keyStoreId) => {
    return await keytokenModel.findOneAndRemove(keyStoreId)
  }

  static deleteKeyById = async (userId) => {
    return await keytokenModel.findOneAndDelete({ _id: userId })
  }
}

module.exports = KeyTokenService
