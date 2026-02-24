const { sendEmail } = require('../utils/emailService');
const { sendSms } = require('../utils/smsService');
const templates = require('../utils/emailTemplates');

const formatAddress = (address) => {
  if (!address || typeof address !== 'object') return 'Not provided';
  return [
    address.fullName,
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean).join(', ');
};

class NotificationService {
  async sendOtpNotification({ channel, recipient, name, code, expiresMinutes = 5 }) {
    if (channel === 'phone') {
      await sendSms(recipient, `${code} is your ${process.env.APP_NAME || 'Revive Roots Essentials'} OTP. Expires in ${expiresMinutes} minutes. Do not share this code.`);
      return;
    }

    const html = templates.otpTemplate({
      name,
      code,
      channel: 'email',
      expiresMinutes,
    });
    await sendEmail(recipient, 'Your verification code', html);
  }

  async sendWelcomeEmail(user) {
    if (!user?.email) return;
    const html = templates.welcomeTemplate({ name: user.name });
    await sendEmail(user.email, `Welcome to ${process.env.APP_NAME || 'Revive Roots Essentials'}`, html);
  }

  async sendLoginAlert(user, metadata = {}) {
    if (!user?.email) return;
    const html = templates.loginAlertTemplate({
      name: user.name,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      time: metadata.time || new Date().toISOString(),
    });
    await sendEmail(user.email, 'New login detected on your account', html);
  }

  async sendOrderPlacedEmail(user, order, items = []) {
    if (!user?.email) return;
    const html = templates.orderPlacedTemplate({
      name: user.name,
      orderNumber: order.orderNumber,
      orderDate: new Date(order.createdAt || Date.now()).toLocaleString(),
      items,
      total: order.totalAmount,
      shippingAddress: formatAddress(order.shippingAddress),
    });
    await sendEmail(user.email, `Order received: ${order.orderNumber}`, html);
  }

  async sendReceiptEmail(user, order, items = []) {
    if (!user?.email) return;
    const html = templates.receiptTemplate({
      name: user.name,
      orderNumber: order.orderNumber,
      paidAt: new Date().toLocaleString(),
      paymentMethod: order.paymentMethod,
      items,
      total: order.totalAmount,
    });
    await sendEmail(user.email, `Payment receipt: ${order.orderNumber}`, html);
  }

  async sendRefundEmail(user, order, reason) {
    if (!user?.email) return;
    const html = templates.refundTemplate({
      name: user.name,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      reason,
      processedAt: new Date().toLocaleString(),
    });
    await sendEmail(user.email, `Refund processed: ${order.orderNumber}`, html);
  }

  async sendOrderStatusEmail(user, order, note) {
    if (!user?.email) return;
    const html = templates.orderStatusTemplate({
      name: user.name,
      orderNumber: order.orderNumber,
      status: order.status,
      note,
    });
    await sendEmail(user.email, `Order status update: ${order.orderNumber}`, html);
  }
}

module.exports = new NotificationService();
