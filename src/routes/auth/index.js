const express = require('express')
const passport = require('passport')
const routes = express.Router()

const { asyncHandler } = require('../../auth/checkAuth')
const AuthController = require('../../controllers/authController')
const { authentication } = require('../../auth/authUtils')
const uploadCloud = require('../../helpers/cloudinary.config')

routes.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

routes.post('/refreshToken', asyncHandler(AuthController.handleRefreshToken))

routes.get('/logout', authentication, asyncHandler(AuthController.logout))

routes.post('/login', asyncHandler(AuthController.handleLogin))

routes.post('/signup', asyncHandler(AuthController.handleSignup))

// routes.post('/signup', asyncHandler(AuthController.signup))

routes.get('/profile', asyncHandler(AuthController.getProfileUser))
routes.post(
  '/update-profile',
  authentication,
  uploadCloud.any(['avatar', 'backgroundImage']),
  asyncHandler(AuthController.updateProfileUser)
)

routes.get('/login/failed', asyncHandler(AuthController.failedPassport))

routes.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/v1/auth/login/failed',
  }),
  asyncHandler(AuthController.handleToken)
)

module.exports = routes
