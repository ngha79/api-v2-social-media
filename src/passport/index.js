const passport = require('passport')
const { User } = require('../models/user.model')
const crypto = require('crypto')
const {
  findUserByEmail,
  findUserById,
} = require('../models/repositories/user.repo')
const KeyTokenService = require('../services/keytoken.service')
const { createTokenPair } = require('../auth/authUtils')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const { hashPassword } = require('../utils')

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID_GOOGLE,
      clientSecret: process.env.CLIENT_SECRET_GOOGLE,
      callbackURL: '/api/v1/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      let checkUser = await findUserByEmail(profile.emails[0].value)
      if (!checkUser) {
        checkUser = await User.create({
          authId: profile.id,
          avatar: profile.photos[0].value,
          name: profile.displayName,
          email: profile.emails[0].value,
        })
      }
      done(null, checkUser)
    }
  )
)

passport.use(
  'login',
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async function (email, password, done) {
      if (password.length < 6) {
        return done('Mật khẩu phải từ 6 ký tự trở lên.', false)
      }
      let checkUser = await findUserByEmail(email)
      if (!checkUser) {
        return done(null, false)
      }
      const checkPassword = await bcrypt.compare(password, checkUser.password)
      if (!checkPassword) {
        return done('Mật khẩu không chính xác.', false)
      }
      done(null, checkUser)
    }
  )
)

passport.use(
  'local-signup',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async function (req, email, password, done) {
      if (password.length < 6) {
        return done('Mật khẩu phải từ 6 ký tự trở lên.', false)
      }
      let checkUser = await findUserByEmail(email)
      if (!checkUser) {
        let newUser = new User({
          password: await hashPassword(password),
          email: email,
        })
        newUser.save()
        return done(null, newUser)
      }
      return done('Email đã được đăng ký.', false)
    }
  )
)

passport.serializeUser((data, done) => {
  return done(null, data)
})

passport.deserializeUser(async (data, done) => {
  try {
    const user = await findUserById(data._id)
    if (user) {
      done(null, {
        _id: user._id,
        email: user.email,
        name: user.name,
      })
    } else {
      done(null, false)
    }
  } catch (error) {
    done(err)
  }
})
