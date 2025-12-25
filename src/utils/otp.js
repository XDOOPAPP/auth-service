const bcrypt = require("bcrypt");

exports.generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.hashOtp = async (otp) => {
  return await bcrypt.hash(String(otp), 10);
};
