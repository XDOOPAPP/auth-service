const jwt = require("jsonwebtoken");
const env = require("../config/env");

exports.signAccessToken = (payload) => {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  console.log('[Auth Service] Signing token. Secret start:', env.jwtSecret ? env.jwtSecret.substring(0, 5) : 'NONE');
  console.log('[Auth Service] Payload:', JSON.stringify(payload));
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: "15m",
  });
};

exports.signRefreshToken = () => {
  if (!env.jwtRefreshSecret) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }

  return jwt.sign({}, env.jwtRefreshSecret, {
    expiresIn: "7d",
  });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};
