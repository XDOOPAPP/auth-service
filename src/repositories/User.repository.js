const User = require("../models/User.model");

class UserRepository {

  async create(data) {
    return User.create(data);
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }

  async find(query) {
    return User.find(query);
  }

  async findByEmailWithOtp(email) {
    return User.findOne({ email })
      .select("+otpHash +otpExpiredAt");
  }

  async findById(id) {
    return User.findById(id);
  }

  async update(user) {
    return user.save();
  }
}

module.exports = new UserRepository();
