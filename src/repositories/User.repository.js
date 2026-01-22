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

  async update(user) {
    return user.save();
  }

  async deleteById(id) {
    return User.findByIdAndDelete(id);
  }

  async findAll(query = {}, skip = 0, limit = 10) {
    return User.find(query)
      .skip(skip)
      .limit(limit)
      .select("-passwordHash -otpHash -otpExpiredAt")
      .sort({ createdAt: -1 });
  }

  async countByQuery(query = {}) {
    return User.countDocuments(query);
  }
}

module.exports = new UserRepository();
