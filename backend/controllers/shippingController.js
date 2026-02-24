const { ShippingFee } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const currencyService = require('../services/currencyService');
const shippingService = require('../services/shippingService');

exports.getAllShippingFees = catchAsync(async (req, res) => {
  const fees = await ShippingFee.findAll({ order: [['createdAt', 'DESC']] });
  res.json(fees);
});

exports.createShippingFee = catchAsync(async (req, res) => {
  const fee = await ShippingFee.create(req.body);
  res.status(201).json(fee);
});

exports.updateShippingFee = catchAsync(async (req, res, next) => {
  const fee = await ShippingFee.findByPk(req.params.id);
  if (!fee) return next(new AppError('Shipping fee not found', 404));
  await fee.update(req.body);
  res.json(fee);
});

exports.deleteShippingFee = catchAsync(async (req, res, next) => {
  const fee = await ShippingFee.findByPk(req.params.id);
  if (!fee) return next(new AppError('Shipping fee not found', 404));
  await fee.destroy();
  res.status(204).json(null);
});

exports.quoteShippingFee = catchAsync(async (req, res, next) => {
  const { shippingAddress } = req.body;
  if (!shippingAddress || !shippingAddress.country) {
    return next(new AppError('Shipping address with country is required', 400));
  }

  const pricingContext = await currencyService.getPricingContext(req);
  const quote = await shippingService.getShippingFee(shippingAddress, pricingContext);

  res.json({
    ...quote,
    countryCode: pricingContext.countryCode,
  });
});

