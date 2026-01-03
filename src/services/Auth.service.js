const userRepo = require("../repositories/User.repository");
const hashUtil = require("../utils/hash");
const jwtUtil = require("../utils/jwt");
const RefreshToken = require("../models/RefreshToken.model");
const emailService = require("../services/Email.service");
const { generateOtp, hashOtp } = require("../utils/otp");
const AppError = require("../utils/appError");

class AuthService {

  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  async register(email, password, fullName) {
    const existing = await userRepo.findByEmail(email);
    if (existing) throw new AppError("Email already exists");

    const passwordHash = await hashUtil.hash(password);
    const otp = generateOtp();

    await userRepo.create({
      email,
      passwordHash,
      fullName,
      isVerified: false,
      otpHash: await hashOtp(otp),
      otpExpiredAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await emailService.sendOtp(email, otp);

    return {
      message: "OTP sent to email. Please verify your account."
    };
  }

  async verifyOtp(email, otp) {
    const user = await userRepo.findByEmailWithOtp(email);
    if (!user) throw new AppError("User not found");

    if (!user.otpHash || !user.otpExpiredAt) {
      throw new AppError("Invalid or expired OTP");
    }

    if (new Date() > new Date(user.otpExpiredAt)) {
      throw new AppError("Invalid or expired OTP");
    }

    const isValidOtp = await hashUtil.compare(
      String(otp),
      user.otpHash
    );

    if (!isValidOtp) {
      throw new AppError("Invalid or expired OTP");
    }

    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiredAt = null;

    await userRepo.update(user);

    const refreshToken = jwtUtil.signRefreshToken();

    const tokenDoc = await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    user.refreshTokens.push(tokenDoc._id);
    await userRepo.update(user);

    const bus = this.eventBus;
    await bus.publish("USER_CREATED", { userId: user._id.toString() });

    return {
      accessToken: jwtUtil.signAccessToken({
        userId: user._id,
        role: user.role
      }),
      refreshToken
    };
  }

  async resendOtp(email) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new AppError("User not found");

    if (user.isVerified) {
      throw new AppError("Account already verified");
    }

    const otp = generateOtp();

    user.otpHash = await hashOtp(otp);
    user.otpExpiredAt = new Date(Date.now() + 5 * 60 * 1000);

    await userRepo.update(user);
    await emailService.sendOtp(email, otp);

    return {
      message: "OTP resent to email"
    };
  }


  async login(email, password) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new AppError("Invalid credentials");

    if (!user.isVerified)
      throw new AppError("Account not verified");

    const match = await hashUtil.compare(password, user.passwordHash);
    if (!match) throw new AppError("Invalid credentials");

    const refreshToken = jwtUtil.signRefreshToken();
    const tokenDoc = await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 86400000)
    });

    user.refreshTokens.push(tokenDoc._id);
    await userRepo.update(user);

    return {
      accessToken: jwtUtil.signAccessToken({
        userId: user._id,
        role: user.role
      }),
      refreshToken
    };
  }

  async refresh(refreshToken) {
    const tokenDoc = await RefreshToken.findOne({
      token: refreshToken,
      isRevoked: false
    }).populate("user");

    if (!tokenDoc)
      throw new AppError("Invalid refresh token");

    if (tokenDoc.expiresAt < new Date())
      throw new AppError("Refresh token expired");

    return {
      accessToken: jwtUtil.signAccessToken({
        userId: tokenDoc.user._id,
        role: tokenDoc.user.role
      })
    };
  }

  async getProfile(userId) {
    const user = await userRepo.findById(userId);
    if (!user) throw new AppError("User not found");

    return {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };
  }

  async forgotPassword(email) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new AppError("User not found");

    const otp = generateOtp();

    user.otpHash = await hashOtp(otp);
    user.otpExpiredAt = new Date(Date.now() + 5 * 60 * 1000);
    await userRepo.update(user);

    await emailService.sendOtp(email, otp);

    return { message: "OTP sent to email" };
  }

  async resetPassword(email, otp, newPassword) {
    const user = await userRepo.findByEmailWithOtp(email);
    if (!user) throw new AppError("User not found");

    const isValidOtp = await hashUtil.compare(otp, user.otpHash)
    if (
      !user.otpHash ||
      user.otpExpiredAt < new Date() ||
      !isValidOtp
    ) {
      throw new AppError("Invalid or expired OTP");
    }

    user.passwordHash = await hashUtil.hash(newPassword);
    user.otpHash = null;
    user.otpExpiredAt = null;
    await userRepo.update(user);

    return { message: "Password reset successful" };
  }


  async verifyToken(token) {
    try {
      const payload = jwtUtil.verifyToken(token, process.env.JWT_SECRET);
      return {
        valid: true,
        userId: payload.userId,
        role: payload.role
      };
    } catch {
      return { valid: false };
    }
  }

}

module.exports = AuthService;
