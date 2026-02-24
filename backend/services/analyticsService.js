const { User, Product, Order, sequelize } = require('../models');
const { Op } = require('sequelize');

class AnalyticsService {
  async getDashboardStats() {
    const totalUsers = await User.count();
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();
    const totalRevenue = await Order.sum('totalAmount', {
      where: { paymentStatus: 'paid' },
    });

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue || 0,
    };
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