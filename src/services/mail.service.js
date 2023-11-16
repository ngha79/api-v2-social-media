'use strict'
const nodemailer = require('nodemailer')
require('dotenv').config()

module.exports = {
  sendMailForgotPassword: async ({ email, otp }) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    const mailOption = await transporter.sendMail({
      from: '"Hà Nguyễn 👻" <foo@example.com>',
      to: email,
      subject: 'Mã xác thực quên mật khẩu',
      text: 'Xin chào',
      html: `<h1>Mã xác thực tài khoản của bạn là: <b>${otp}</b></h1><br/><h2>Mã xác thực có thời hạn 5 phút, hãy nhanh chóng đổi mật khẩu trước khi hết hạn.</h2>`, // html body
    })
  },
}
