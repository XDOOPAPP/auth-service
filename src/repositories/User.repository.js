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
    if (!allowedPeriods.includes(period)) period = 'daily';

    days = Number(days);
    if (isNaN(days) || days <= 0) days = 30;

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    let groupId;
    let sortStage = {};
    const timezone = 'Asia/Ho_Chi_Minh';

    switch (period) {
      case 'daily':
        groupId = {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
            timezone
          }
        };
        sortStage = { _id: 1 };
        break;

      case 'weekly':
        groupId = {
          year: { $isoWeekYear: '$createdAt' },
          week: { $isoWeek: '$createdAt' }
        };
        sortStage = { '_id.year': 1, '_id.week': 1 };
        break;

      case 'monthly':
        groupId = {
          $dateToString: {
            format: '%Y-%m',
            date: '$createdAt',
            timezone
          }
        };
        sortStage = { _id: 1 };
        break;
    }

    const rawStats = await User.aggregate([
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
      { $sort: sortStage }
    ]);

    // Format output
    let stats = rawStats.map(item => {
      if (period === 'weekly') {
        return {
          period: `${item._id.year}-W${item._id.week}`,
          count: item.count
        };
      }

      return {
        period: item._id,
        count: item.count
      };
    });

    // Fill missing dates (daily / monthly)
    if (period === 'daily') {
      const map = new Map(stats.map(i => [i.period, i.count]));
      const filled = [];

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);

        const key = d.toLocaleDateString('sv-SE', { timeZone: timezone });
        filled.push({
          period: key,
          count: map.get(key) || 0
        });
      }
      stats = filled;
    }

    return stats;
  }

  async getTotalUsersStats() {
    const [stats] = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          verified: {
            $sum: { $cond: ['$isVerified', 1, 0] }
          },
          user: {
            $sum: { $cond: [{ $eq: ['$role', 'USER'] }, 1, 0] }
          }
        }
      }
    ]);

    return stats || { total: 0, verified: 0, user: 0 };
  }
}

module.exports = new UserRepository();
