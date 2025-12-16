const User = require("../models/User.model");

class UserRepository {
  async create(data) {
    return User.create(data);
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }

  async findById(id) {
    return User.findById(id);
  }

  async update(user) {
    return user.save();
  }
}

module.exports = new UserRepository();