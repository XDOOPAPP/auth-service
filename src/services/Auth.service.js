const userRepo = require("../repositories/User.repository");
const hashUtil = require("../utils/hash");
const jwtUtil = require("../utils/jwt");
const RefreshToken = require("../models/RefreshToken.model");

class AuthService {
  async register(email, password, fullName) {
    const existing = await userRepo.findByEmail(email);
    if (existing) throw new Error("Email already exists");

    const passwordHash = await hashUtil.hash(password);

    const user = await userRepo.create({
      email,
      passwordHash, 
      fullName
    });

    const refreshTokenString = jwtUtil.signRefreshToken();
    const refreshTokenDoc = await RefreshToken.create({
      token: refreshTokenString,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 86400000)
    });

    user.refreshTokens.push(refreshTokenDoc._id);
    await userRepo.update(user);

    return {
      accessToken: jwtUtil.signAccessToken({ id: user._id, role: user.role }),
      refreshToken: refreshTokenString
    };
  }

  async login(email, password) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const match = await hashUtil.compare(password, user.passwordHash);
    if (!match) throw new Error("Invalid credentials");

    const refreshTokenString = jwtUtil.signRefreshToken();
    const refreshTokenDoc = await RefreshToken.create({
      token: refreshTokenString,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 86400000)
    });

    user.refreshTokens.push(refreshTokenDoc._id);
    await userRepo.update(user);

    return {
      accessToken: jwtUtil.signAccessToken({ id: user._id, role: user.role }),
      refreshToken: refreshTokenString
    };
  }

  async refresh(refreshToken) {
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken })
      .populate("user");

    if (!tokenDoc || tokenDoc.expiresAt < new Date())
      throw new Error("Invalid refresh token");

    const user = tokenDoc.user;

    return {
      accessToken: jwtUtil.signAccessToken({ id: user._id, role: user.role })
    };
  }

  async getProfile(userId) {
    const user = await userRepo.findById(userId);
    return { id: user._id, email: user.email, fullName: user.fullName, role: user.role };
  }

}

module.exports = new AuthService();