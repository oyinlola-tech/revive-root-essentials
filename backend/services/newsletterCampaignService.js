const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Newsletter, User, Product, NewsletterCampaignLog } = require('../models');
const { sendEmail } = require('../utils/emailService');
const templates = require('../utils/emailTemplates');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const APP_NAME = process.env.APP_NAME || 'Revive Roots Essentials';
const NEWSLETTER_DAY_UTC = Number(process.env.NEWSLETTER_WEEKLY_DAY_UTC ?? 1); // Monday
const NEWSLETTER_HOUR_UTC = Number(process.env.NEWSLETTER_WEEKLY_HOUR_UTC ?? 9); // 09:00 UTC

const toLower = (value) => String(value || '').trim().toLowerCase();

const getIsoWeekKey = (date = new Date()) => {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const getUnsubscribeToken = (email) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign({ email: toLower(email), scope: 'newsletter-unsubscribe' }, secret, { expiresIn: '365d' });
};

const buildUnsubscribeUrl = (email) => `${FRONTEND_URL}/newsletter/unsubscribe?token=${encodeURIComponent(getUnsubscribeToken(email))}`;

const buildRecipientMap = async () => {
  const recipients = new Map();

  const subscribers = await Newsletter.findAll({
    where: { isActive: true },
    attributes: ['email'],
  });

  for (const subscriber of subscribers) {
    const email = toLower(subscriber.email);
    if (!email) continue;
    recipients.set(email, { email, name: null });
  }

  const users = await User.findAll({
    where: {
      acceptedNewsletter: true,
      newsletterUnsubscribedAt: { [Op.is]: null },
      isVerified: true,
    },
    attributes: ['email', 'name'],
  });

  for (const user of users) {
    const email = toLower(user.email);
    if (!email) continue;
    recipients.set(email, { email, name: user.name || null });
  }

  return recipients;
};

const getLatestProducts = async () => {
  const products = await Product.findAll({
    where: {
      stock: { [Op.gt]: 0 },
    },
    attributes: ['id', 'name', 'description', 'price', 'imageUrl'],
    order: [['createdAt', 'DESC']],
    limit: 15,
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    imageUrl: product.imageUrl,
    url: `${FRONTEND_URL}/product/${product.id}`,
  }));
};

const sendNewsletterCampaign = async ({ source = 'manual', enforceWeeklyGuard = false } = {}) => {
  const weekKey = getIsoWeekKey(new Date());
  if (enforceWeeklyGuard) {
    const alreadySent = await NewsletterCampaignLog.findOne({ where: { weekKey } });
    if (alreadySent) {
      return {
        sent: false,
        reason: `Campaign already sent for ${weekKey}`,
        weekKey,
        recipientCount: alreadySent.recipientCount,
      };
    }
  }

  const recipientsMap = await buildRecipientMap();
  const recipients = Array.from(recipientsMap.values());
  if (recipients.length === 0) {
    return { sent: false, reason: 'No active recipients', weekKey, recipientCount: 0 };
  }

  const products = await getLatestProducts();
  if (products.length === 0) {
    return { sent: false, reason: 'No products available for campaign', weekKey, recipientCount: 0 };
  }

  const subject = `${APP_NAME} Weekly Luxury Edit - Latest 15 Products`;
  for (const recipient of recipients) {
    const html = templates.weeklyNewsletterTemplate({
      recipientName: recipient.name,
      products,
      unsubscribeUrl: buildUnsubscribeUrl(recipient.email),
    });

    await sendEmail(recipient.email, subject, html);
  }

  if (enforceWeeklyGuard) {
    await NewsletterCampaignLog.upsert({
      weekKey,
      sentAt: new Date(),
      sentBy: source === 'scheduler' ? 'scheduler' : 'manual',
      recipientCount: recipients.length,
    });
  }

  return {
    sent: true,
    weekKey,
    recipientCount: recipients.length,
    productCount: products.length,
    source,
  };
};

const shouldRunNow = (date = new Date()) => {
  return date.getUTCDay() === NEWSLETTER_DAY_UTC && date.getUTCHours() === NEWSLETTER_HOUR_UTC;
};

module.exports = {
  sendNewsletterCampaign,
  shouldRunNow,
  getIsoWeekKey,
  getUnsubscribeToken,
};
