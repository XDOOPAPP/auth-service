const jwt = require("jsonwebtoken");

exports.signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });

exports.signRefreshToken = () =>
  jwt.sign({}, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

exports.verifyToken = (token, secret) =>
  jwt.verify(token, secret);