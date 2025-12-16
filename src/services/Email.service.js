const nodemailer = require("nodemailer");
const env = require("../config/env");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.emailUser,
        pass: env.emailPass
      }
    });
  }

  async sendOtp(email, otp, purpose) {
    const subject =
      purpose === "VERIFY"
        ? "Verify your account"
        : "Reset your password";

    await this.transporter.sendMail({
      from: `"FEPA" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: `
        <h3>Your OTP Code</h3>
        <h1>${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
      `
    });
  }
}

module.exports = new EmailService();