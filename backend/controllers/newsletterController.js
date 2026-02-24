const { Newsletter } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.subscribe = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const [subscriber, created] = await Newsletter.findOrCreate({
    where: { email },
    defaults: { isActive: true },
  });

  if (!created && !subscriber.isActive) {
    subscriber.isActive = true;
    await subscriber.save();
  }

  res.status(201).json({ message: 'Subscribed successfully' });
});

exports.getAllSubscribers = catchAsync(async (req, res, next) => {
  const subscribers = await Newsletter.findAll({ where: { isActive: true } });
  res.json(subscribers);
});