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

  async getUserStatsOverTime(period = 'daily', days = 30) {
    // Validate input
    const allowedPeriods = ['daily', 'weekly', 'monthly'];
    if (!allowedPeriods.includes(period)) {
      period = 'daily';
    }

    days = Number(days);
    if (isNaN(days) || days <= 0) {
      days = 30;
    }

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // group format
    let groupId;

    switch (period) {
      case 'daily':
        groupId = {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt'
          }
        };
        break;

      case 'weekly':
        // ISO week 
        groupId = {
          year: { $isoWeekYear: '$createdAt' },
          week: { $isoWeek: '$createdAt' }
        };
        break;

      case 'monthly':
        groupId = {
          $dateToString: {
            format: '%Y-%m',
            date: '$createdAt'
          }
        };
        break;
    }

    // Aggregate pipeline
    const result = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: groupId,
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return result.map(item => ({
      period: item._id,
      count: item.count
    }));
  }

  async getTotalUsersStats() {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const userCount = await User.countDocuments({ role: 'USER' });

    return {
      total: totalUsers,
      verified: verifiedUsers,
      user: userCount
    };
  }

}

module.exports = new UserRepository();
