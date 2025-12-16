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

}

module.exports = new AuthService();