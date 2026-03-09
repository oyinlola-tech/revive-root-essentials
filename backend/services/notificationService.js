const { sendEmail } = require('../utils/emailService');
const { sendSms } = require('../utils/smsService');
const templates = require('../utils/emailTemplates');
const { User } = require('../models');
const { Op } = require('sequelize');

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
  async getAdminRecipients() {
    return User.findAll({
      where: {
        role: { [Op.in]: ['admin', 'superadmin'] },
      },
      attributes: ['id', 'email', 'name'],
    });
  }

  async sendOtpNotification({ channel, recipient, name, code, expiresMinutes = 5, verificationUrl }) {
    if (channel === 'phone') {
      await sendSms(recipient, `${code} is your ${process.env.APP_NAME || 'Revive Roots Essentials'} OTP. Expires in ${expiresMinutes} minutes. Do not share this code.`);
      return;
    }

    const html = templates.otpTemplate({
      name,
      code,
      channel: 'email',
      expiresMinutes,
      verificationUrl,
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
      currency: order.currency || 'NGN',
      shippingAddress: formatAddress(order.shippingAddress),
    });
    await sendEmail(user.email, `Order received: ${order.orderNumber}`, html);
  }

  async sendAdminOrderAlert(order, items = [], customer = null) {
    const recipients = await this.getAdminRecipients();
    if (!recipients.length) return;

    const html = templates.adminOrderAlertTemplate({
      orderNumber: order.orderNumber,
      orderDate: new Date(order.createdAt || Date.now()).toLocaleString(),
      customerName: customer?.name,
      customerEmail: customer?.email,
      items,
      total: order.totalAmount,
      currency: order.currency || 'NGN',
      shippingAddress: formatAddress(order.shippingAddress),
    });

    await Promise.all(recipients
      .filter((recipient) => recipient.email)
      .map((recipient) => sendEmail(recipient.email, `New order placed: ${order.orderNumber}`, html)));
  }

  async sendAdminContactAlert(contact) {
    const recipients = await this.getAdminRecipients();
    if (!recipients.length) return;

    const html = templates.adminContactAlertTemplate({
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
      submittedAt: new Date(contact.createdAt || Date.now()).toLocaleString(),
    });

    await Promise.all(recipients
      .filter((recipient) => recipient.email)
      .map((recipient) => sendEmail(recipient.email, `New contact message: ${contact.subject || 'General inquiry'}`, html)));
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
      currency: order.currency || 'NGN',
    });
    await sendEmail(user.email, `Payment receipt: ${order.orderNumber}`, html);
  }

  async sendPaymentFailedEmail(user, order, items = [], reason = '') {
    if (!user?.email) return;
    const html = templates.paymentFailedTemplate({
      name: user.name,
      orderNumber: order.orderNumber,
      attemptedAt: new Date().toLocaleString(),
      paymentMethod: order.paymentMethod,
      items,
      total: order.totalAmount,
      reason: reason || 'Payment was not confirmed by the processor.',
      currency: order.currency || 'NGN',
    });
    await sendEmail(user.email, `Payment attempt failed: ${order.orderNumber}`, html);
  }

  async sendRefundEmail(user, order, reason) {
    if (!user?.email) return;
    const html = templates.refundTemplate({
      name: user.name,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      reason,
      processedAt: new Date().toLocaleString(),
      currency: order.currency || 'NGN',
    });
    await sendEmail(user.email, `Refund processed: ${order.orderNumber}`, html);
  }

  async sendRefundStatusEmail(user, order, refund, metadata = {}) {
    if (!user?.email || !order?.orderNumber || !refund?.status) return;

    const html = templates.refundStatusTemplate({
      name: user.name,
      orderNumber: order.orderNumber,
      status: refund.status,
      requestedAmount: refund.requestedAmount,
      approvedAmount: refund.approvedAmount,
      reason: refund.reason,
      note: metadata.note || refund.adminNotes,
      processedAt: metadata.processedAt || refund.processedAt || refund.updatedAt || new Date().toLocaleString(),
      currency: order.currency || 'NGN',
    });

    const subjectPrefix = {
      pending: 'Refund request received',
      approved: 'Refund approved',
      rejected: 'Refund update',
      completed: 'Refund completed',
    }[refund.status] || 'Refund update';

    await sendEmail(user.email, `${subjectPrefix}: ${order.orderNumber}`, html);
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
