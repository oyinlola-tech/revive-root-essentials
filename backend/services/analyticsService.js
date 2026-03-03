const { User, Product, Order, sequelize } = require('../models');
const { Op } = require('sequelize');
const { ensureRedisConnection } = require('../config/redis');

const DASHBOARD_CACHE_TTL_SECONDS = 60;

class AnalyticsService {
  async getDashboardStats() {
    const redis = await ensureRedisConnection();
    if (redis) {
      try {
        const cached = await redis.get('analytics:dashboard');
        if (cached) return JSON.parse(cached);
      } catch (error) {
        // ignore cache read failures
      }
    }

    const totalUsers = await User.count();
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();
    const totalRevenue = await Order.sum('totalAmount', {
      where: { paymentStatus: 'paid' },
    });

    const stats = {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue || 0,
    };

    if (redis) {
      try {
        await redis.set('analytics:dashboard', JSON.stringify(stats), 'EX', DASHBOARD_CACHE_TTL_SECONDS);
      } catch (error) {
        // ignore cache write failures
      }
    }

    return stats;
  }

  async getSalesData(startDate, endDate) {
    const sales = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
      ],
      where: {
        paymentStatus: 'paid',
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
    });
    return sales;
  }

  // other analytics methods...
}

module.exports = new AnalyticsService();
