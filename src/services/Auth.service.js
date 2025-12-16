const userRepo = require("../repositories/User.repository");
const hashUtil = require("../utils/hash");
const jwtUtil = require("../utils/jwt");

class AuthService {
  async register(email, password) {
    const existing = await userRepo.findByEmail(email);
    if (existing) throw new Error("Email already exists");

    const passwordHash = await hashUtil.hash(password);

    const refreshToken = jwtUtil.signRefreshToken();

    const user = await userRepo.create({
      email,
      passwordHash,
      refreshToken,
      refreshTokenExpiry: new Date(Date.now() + 7 * 86400000)
    });

    return {
      accessToken: jwtUtil.signAccessToken({ id: user._id, role: user.role }),
      refreshToken
    };
  }

  async login(email, password) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const match = await hashUtil.compare(password, user.passwordHash);
    if (!match) throw new Error("Invalid credentials");

    user.refreshToken = jwtUtil.signRefreshToken();
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 86400000);
    await userRepo.update(user);

    return {
      accessToken: jwtUtil.signAccessToken({ id: user._id, role: user.role }),
      refreshToken: user.refreshToken
    };
  }

  async refresh(refreshToken) {
    const user = await userRepo.findByEmail(
      (await require("jsonwebtoken").decode(refreshToken))?.email
    );

    if (
      !user ||
      user.refreshToken !== refreshToken ||
      user.refreshTokenExpiry < new Date()
    )
      throw new Error("Invalid refresh token");

    return {
      accessToken: jwtUtil.signAccessToken({ id: user._id, role: user.role })
    };
  }

  async getProfile(userId) {
    const user = await userRepo.findById(userId);
    return { id: user._id, email: user.email, role: user.role };
  }

}

module.exports = new AuthService();