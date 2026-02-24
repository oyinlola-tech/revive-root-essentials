const analyticsService = require('../services/analyticsService');
const catchAsync = require('../utils/catchAsync');

exports.getDashboard = catchAsync(async (req, res, next) => {
  const stats = await analyticsService.getDashboardStats();
  res.json(stats);
});

exports.getSales = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  // Validate dates...
  const sales = await analyticsService.getSalesData(startDate, endDate);
  res.json(sales);
});

exports.getProductAnalytics = catchAsync(async (req, res, next) => {
  // Placeholder
  res.json({ message: 'Product analytics endpoint' });
});

exports.getUserAnalytics = catchAsync(async (req, res, next) => {
  // Placeholder
  res.json({ message: 'User analytics endpoint' });
});