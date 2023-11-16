const { BadRequestError } = require('../core/error.response')
const Otp = require('../models/otp.model')
const bcrypt = require('bcrypt')
const { sendMailForgotPassword } = require('./mail.service')

class OtpService {
  static insertOtp = async ({ otp, email }) => {
    const salt = await bcrypt.genSalt(8)
    const hasdOtp = await bcrypt.hash(otp, salt)
    const newotp = await Otp.create({
      email,
      otp: hasdOtp,
    })
    if (newotp) {
      await sendMailForgotPassword({ email, otp })
    }
    return newotp ? 1 : 0
  }

  static compareOtp = async ({ email, otp }) => {
    const otpHolder = await Otp.findOne({ email })
    if (!otpHolder)
      throw new BadRequestError(
        'Mã xác nhận đã hết hạn hoặc email bạn nhập không chính xác.'
      )
    const compareOtp = await bcrypt.compare(otp, otpHolder.otp)
    return compareOtp
  }

  static deleteOtp = async (email) => {
    return await Otp.deleteMany({ email })
  }
}

module.exports = OtpService
