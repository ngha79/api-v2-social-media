const passport = require('passport')
const { ErrorMessage, SuccessResponse } = require('../core/success.response')
const AuthService = require('../services/auth.service')

const { URL_CLIENT } = process.env

class AuthController {
  constructor() {
    this.io = global.io
  }

  handleRefreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get token success.',
      metadata: await AuthService.handleRefreshToken(req.body.refreshToken),
    }).send(res)
  }

  handleToken = async (req, res, next) => {
    const tokens = await AuthService.authToken(req.user)
    let options = {
      maxAge: 1000 * 60 * 60,
    }
    let optionsRefresh = {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    }
    console.log(req.headers)
    res.cookie('accessToken', tokens.accessToken, options)
    res.cookie('refreshToken', tokens.refreshToken, optionsRefresh)
    res.redirect(URL_CLIENT)
  }
  handleLogin = async (req, res, next) => {
    passport.authenticate(
      'login',
      {
        failureRedirect: '/api/v1/auth/login/failed',
      },
      async (err, user, info) => {
        if (err) {
          return res.send({ status: 400, message: err })
        }
        req.logIn(user, async (error) => {
          const tokens = await AuthService.authToken(user)
          let options = {
            maxAge: 1000 * 60 * 60,
            httpOnly: false,
            domain: req.headers.host,
          }
          let optionsRefresh = {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: false,
            domain: req.headers.host,
          }
          console.log(req.headers)
          res.cookie('accessToken', tokens.accessToken, options)
          res.cookie('refreshToken', tokens.refreshToken, optionsRefresh)
          return res.send({ user, status: 200, message: 'Success' })
        })
      }
    )(req, res, next)
  }

  handleSignup = async (req, res, next) => {
    passport.authenticate(
      'local-signup',
      {
        failureRedirect: '/api/v1/auth/login/failed',
      },
      async (err, user, info) => {
        if (err) {
          return res.send({ status: 400, message: err })
        }
        if (!user) {
          return res.status(400).json({
            message: 'Có lỗi xảy ra!',
          })
        }
        req.logIn(user, async (error) => {
          const tokens = await AuthService.authToken(req.user)
          let options = {
            maxAge: 1000 * 60 * 60,
            httpOnly: false,
            domain: req.headers.host,
          }
          let optionsRefresh = {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: false,
            domain: req.headers.host,
          }
          res.cookie('accessToken', tokens.accessToken, options)
          res.cookie('refreshToken', tokens.refreshToken, optionsRefresh)
          return res.send({ user: req.user, status: 200, message: 'Success' })
        })
      }
    )(req, res, next)
  }

  failedPassport = async (req, res, next) => {
    new ErrorMessage({
      message: 'Login failed!',
    }).send(res)
  }

  getProfileUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get profile success!',
      metadata: await AuthService.profileUser(req.user?._id),
    }).send(res)
  }

  logout = async (req, res, next) => {
    req.logout(async function (err) {
      if (err) {
        return next(err)
      }
      req.session.destroy(async (err) => {
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        new SuccessResponse({
          message: 'Logout success.',
          metadata: await AuthService.logout(req.keyStore),
        }).send(res)
      })
    })
  }

  updateProfileUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update profile user success.',
      metadata: await AuthService.updateProfileUser(
        req.body,
        req.user._id,
        req.files
      ),
    }).send(res)
  }
}

module.exports = new AuthController()
