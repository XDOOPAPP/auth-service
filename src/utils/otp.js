const crypto = require("crypto");

exports.generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

exports.hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");