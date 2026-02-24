const jwt = require('jsonwebtoken');
const { Newsletter, User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendNewsletterCampaign } = require('../services/newsletterCampaignService');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

exports.subscribe = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const normalizedEmail = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  const [subscriber, created] = await Newsletter.findOrCreate({
    where: { email: normalizedEmail },
    defaults: { isActive: true },
  });

  if (!created && !subscriber.isActive) {
    subscriber.isActive = true;
    await subscriber.save();
  }

  const linkedUser = await User.findOne({ where: { email: normalizedEmail } });
  if (linkedUser) {
    linkedUser.acceptedNewsletter = true;
    linkedUser.newsletterUnsubscribedAt = null;
    await linkedUser.save();
  }

  res.status(201).json({ message: 'Subscribed successfully' });
});

exports.getAllSubscribers = catchAsync(async (req, res, next) => {
  const subscribers = await Newsletter.findAll({ where: { isActive: true } });
  res.json(subscribers);
});

exports.unsubscribe = catchAsync(async (req, res, next) => {
  const { token } = req.query;
  if (!token) {
    return next(new AppError('Unsubscribe token is required', 400));
  }

  let email;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.scope !== 'newsletter-unsubscribe' || !decoded.email) {
      return next(new AppError('Invalid unsubscribe token', 400));
    }
    email = normalizeEmail(decoded.email);
  } catch (error) {
    return next(new AppError('Invalid or expired unsubscribe token', 400));
  }

  const subscriber = await Newsletter.findOne({ where: { email } });
  if (subscriber) {
    subscriber.isActive = false;
    await subscriber.save();
  }

  const user = await User.findOne({ where: { email } });
  if (user) {
    user.acceptedNewsletter = false;
    user.newsletterUnsubscribedAt = new Date();
    await user.save();
  }

  res.json({ message: 'You have been unsubscribed from newsletter emails.' });
});

exports.sendCampaignNow = catchAsync(async (req, res, next) => {
  const result = await sendNewsletterCampaign({ source: 'manual', enforceWeeklyGuard: true });
  res.json(result);
});
