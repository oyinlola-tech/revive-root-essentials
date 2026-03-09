const APP_NAME = process.env.APP_NAME || 'Revive Roots Essentials';
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://revive-root-essentials.telente.site').replace(/\/$/, '');
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@reviverootsessentials.com';
const LOGO_URL = `${FRONTEND_URL}/assets/logo/revive_roots_essential.png`;

const BRAND = {
  ink: '#102117',
  forest: '#173222',
  moss: '#40614d',
  gold: '#d9c988',
  cream: '#f7f2df',
  sand: '#ece3c7',
  white: '#ffffff',
  line: 'rgba(16,33,23,0.12)',
  muted: '#5f6f64',
  success: '#1f6b45',
  warning: '#8a5a0a',
};

const e = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatMoney = (amount, currency = 'NGN') => {
  const normalized = String(currency || 'NGN').toUpperCase();
  const locale = normalized === 'NGN' ? 'en-NG' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: normalized,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
};

const formatStatus = (value) => String(value || '')
  .replace(/[_-]+/g, ' ')
  .replace(/\b\w/g, (match) => match.toUpperCase());

const featureList = (items = []) => {
  if (!items.length) return '';
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:18px 0 0 0;">
      ${items.map((item) => `
        <tr>
          <td width="20" valign="top" style="padding:0 0 10px 0;color:${BRAND.success};font-size:16px;line-height:1.5;">●</td>
          <td valign="top" style="padding:0 0 10px 0;color:${BRAND.ink};font-size:14px;line-height:1.7;">${e(item)}</td>
        </tr>
      `).join('')}
    </table>
  `;
};

const infoCard = (title, rows = []) => `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:18px 0 0 0;background:${BRAND.cream};border:1px solid ${BRAND.line};border-radius:18px;">
    <tr>
      <td style="padding:18px 20px;">
        <p style="margin:0 0 10px 0;color:${BRAND.forest};font-size:12px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;">${e(title)}</p>
        ${rows.map((row) => `
          <p style="margin:0 0 8px 0;color:${BRAND.ink};font-size:14px;line-height:1.7;">
            <strong>${e(row.label)}:</strong> ${e(row.value)}
          </p>
        `).join('')}
      </td>
    </tr>
  </table>
`;

const renderOrderItems = (items = [], currency = 'NGN') => {
  if (!items.length) return '<p style="margin:16px 0 0 0;color:#5f6f64;font-size:14px;line-height:1.7;">No order items were attached to this email.</p>';

  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:18px 0 0 0;border-collapse:collapse;border:1px solid ${BRAND.line};border-radius:18px;overflow:hidden;">
      <thead>
        <tr style="background:${BRAND.cream};">
          <th align="left" style="padding:14px 16px;color:${BRAND.forest};font-size:12px;letter-spacing:1.2px;text-transform:uppercase;">Item</th>
          <th align="center" style="padding:14px 16px;color:${BRAND.forest};font-size:12px;letter-spacing:1.2px;text-transform:uppercase;">Qty</th>
          <th align="right" style="padding:14px 16px;color:${BRAND.forest};font-size:12px;letter-spacing:1.2px;text-transform:uppercase;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item, index) => `
          <tr style="background:${index % 2 === 0 ? BRAND.white : '#fcfaf3'};">
            <td style="padding:14px 16px;border-top:1px solid ${BRAND.line};color:${BRAND.ink};font-size:14px;line-height:1.6;">${e(item.name || 'Product')}</td>
            <td align="center" style="padding:14px 16px;border-top:1px solid ${BRAND.line};color:${BRAND.ink};font-size:14px;">${e(item.quantity || 1)}</td>
            <td align="right" style="padding:14px 16px;border-top:1px solid ${BRAND.line};color:${BRAND.ink};font-size:14px;font-weight:700;">${formatMoney(item.price, currency)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
};

const heroBlock = ({ eyebrow, title, body, accentLabel }) => `
  <p style="margin:0 0 10px 0;color:${BRAND.gold};font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">${e(eyebrow)}</p>
  <h1 style="margin:0 0 14px 0;color:${BRAND.white};font-size:34px;line-height:1.15;font-weight:800;">${e(title)}</h1>
  <p style="margin:0;color:rgba(255,255,255,0.82);font-size:15px;line-height:1.8;max-width:460px;">${e(body)}</p>
  ${accentLabel ? `<p style="margin:18px 0 0 0;"><span style="display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(217,201,136,0.18);border:1px solid rgba(217,201,136,0.28);color:${BRAND.gold};font-size:12px;letter-spacing:1.3px;text-transform:uppercase;font-weight:700;">${e(accentLabel)}</span></p>` : ''}
`;

const baseTemplate = ({
  title,
  preheader,
  eyebrow,
  heroTitle,
  heroBody,
  accentLabel,
  introTitle,
  introBody,
  content,
  ctaLabel,
  ctaUrl,
  secondaryCtaLabel,
  secondaryCtaUrl,
}) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${e(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.sand};font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${e(preheader)}</div>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:linear-gradient(180deg, #f4ead1 0%, #ece3c7 100%);padding:28px 12px;">
      <tr>
        <td align="center">
          <table width="680" cellpadding="0" cellspacing="0" role="presentation" style="max-width:680px;background:${BRAND.white};border-radius:28px;overflow:hidden;border:1px solid ${BRAND.line};box-shadow:0 18px 40px rgba(16,33,23,0.08);">
            <tr>
              <td style="padding:0;background:linear-gradient(135deg, ${BRAND.ink} 0%, ${BRAND.forest} 60%, ${BRAND.moss} 100%);">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:28px 30px 34px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td valign="middle">
                            <table cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                <td valign="middle" style="padding-right:14px;">
                                  <img src="${e(LOGO_URL)}" alt="${e(APP_NAME)}" width="54" height="54" style="display:block;width:54px;height:54px;border-radius:14px;background:${BRAND.cream};padding:6px;" />
                                </td>
                                <td valign="middle">
                                  <p style="margin:0;color:${BRAND.gold};font-size:11px;letter-spacing:2px;text-transform:uppercase;">Rooted in care</p>
                                  <p style="margin:6px 0 0 0;color:${BRAND.white};font-size:22px;font-weight:800;line-height:1.2;">${e(APP_NAME)}</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <div style="margin-top:28px;">
                        ${heroBlock({
                          eyebrow: eyebrow || APP_NAME,
                          title: heroTitle || title,
                          body: heroBody || preheader,
                          accentLabel,
                        })}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 30px 10px 30px;">
                <h2 style="margin:0 0 12px 0;color:${BRAND.ink};font-size:24px;line-height:1.2;">${e(introTitle || title)}</h2>
                <p style="margin:0;color:${BRAND.muted};font-size:15px;line-height:1.8;">${e(introBody || preheader)}</p>
                ${content}
                ${(ctaUrl || secondaryCtaUrl) ? `
                  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:26px 0 0 0;">
                    <tr>
                      ${ctaUrl ? `<td style="padding:0 12px 12px 0;"><a href="${e(ctaUrl)}" style="display:inline-block;background:${BRAND.ink};color:${BRAND.cream};text-decoration:none;padding:14px 22px;border-radius:14px;font-size:14px;font-weight:700;">${e(ctaLabel || 'Continue')}</a></td>` : ''}
                      ${secondaryCtaUrl ? `<td style="padding:0 0 12px 0;"><a href="${e(secondaryCtaUrl)}" style="display:inline-block;background:${BRAND.cream};color:${BRAND.ink};text-decoration:none;padding:14px 22px;border-radius:14px;font-size:14px;font-weight:700;border:1px solid ${BRAND.line};">${e(secondaryCtaLabel || 'Learn More')}</a></td>` : ''}
                    </tr>
                  </table>
                ` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 30px 30px 30px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#fbf8ef;border:1px solid ${BRAND.line};border-radius:18px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 8px 0;color:${BRAND.forest};font-size:12px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;">Need help?</p>
                      <p style="margin:0;color:${BRAND.muted};font-size:13px;line-height:1.8;">
                        If you did not expect this email, or you need support with your order or account, reach us at
                        <a href="mailto:${e(SUPPORT_EMAIL)}" style="color:${BRAND.forest};font-weight:700;text-decoration:none;">${e(SUPPORT_EMAIL)}</a>.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 30px 28px 30px;">
                <p style="margin:0;color:${BRAND.muted};font-size:12px;line-height:1.8;text-align:center;">
                  ${e(APP_NAME)}<br />
                  Premium hair and skincare essentials crafted for healthy routines, visible results, and beautiful rituals.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

exports.otpTemplate = ({ name, code, channel = 'email', expiresMinutes = 5, verificationUrl }) => baseTemplate({
  title: `Your ${APP_NAME} Verification Code`,
  preheader: 'Use this secure code to verify your account and continue.',
  eyebrow: 'Secure verification',
  heroTitle: 'Complete your verification',
  heroBody: `Use the one-time code below to continue your ${channel} verification and keep your account secure.`,
  accentLabel: `${expiresMinutes} minute expiry`,
  introTitle: `Hello ${name || 'there'}, your verification code is ready.`,
  introBody: 'Enter this code on the verification screen, or use the direct verification link below if you prefer a faster flow.',
  content: `
    <div style="margin:22px 0 0 0;padding:20px 18px;background:${BRAND.cream};border:1px dashed ${BRAND.moss};border-radius:20px;text-align:center;">
      <p style="margin:0 0 8px 0;color:${BRAND.forest};font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">One-time passcode</p>
      <p style="margin:0;color:${BRAND.ink};font-size:38px;line-height:1;font-weight:800;letter-spacing:8px;">${e(code)}</p>
    </div>
    ${featureList([
      `This code expires in ${expiresMinutes} minutes.`,
      'Do not share this code with anyone, including support staff.',
      verificationUrl ? 'You can also verify instantly with the secure button below.' : 'Return to the app after entering the code to finish verification.',
    ])}
  `,
  ctaLabel: verificationUrl ? 'Verify My Email' : undefined,
  ctaUrl: verificationUrl,
  secondaryCtaLabel: 'Visit Account',
  secondaryCtaUrl: `${FRONTEND_URL}/account`,
});

exports.welcomeTemplate = ({ name }) => baseTemplate({
  title: `Welcome to ${APP_NAME}`,
  preheader: 'Your account is live. Explore curated essentials and manage everything from your dashboard.',
  eyebrow: 'Welcome aboard',
  heroTitle: 'Your ritual starts here',
  heroBody: 'Your Revive Roots account is active and ready for smoother shopping, saved preferences, and order tracking.',
  accentLabel: 'Account activated',
  introTitle: `Welcome, ${name || 'beautiful human'}.`,
  introBody: 'We built Revive Roots Essentials to make premium hair and skincare feel intentional, calm, and effective from first use to reorder.',
  content: featureList([
    'Discover premium hair and skincare essentials curated for consistent routines.',
    'Track your orders, refunds, and saved preferences from one account dashboard.',
    'Get first access to launches, product edits, and routine support when you opt in.',
  ]),
  ctaLabel: 'Start Shopping',
  ctaUrl: `${FRONTEND_URL}/shop`,
  secondaryCtaLabel: 'Open My Account',
  secondaryCtaUrl: `${FRONTEND_URL}/account`,
});

exports.loginAlertTemplate = ({ name, ipAddress, userAgent, time }) => baseTemplate({
  title: `New Login Detected - ${APP_NAME}`,
  preheader: 'A sign-in was detected on your account. Review it if this was not you.',
  eyebrow: 'Security alert',
  heroTitle: 'We noticed a new sign-in',
  heroBody: 'Your account security matters. Review the login details below and reset your password if anything looks unfamiliar.',
  accentLabel: 'Security check',
  introTitle: `Hello ${name || 'there'},`,
  introBody: 'A fresh login was recorded on your account. If this was you, no action is needed.',
  content: `
    ${infoCard('Login details', [
      { label: 'Time', value: time || new Date().toISOString() },
      { label: 'IP address', value: ipAddress || 'Unknown' },
      { label: 'Device', value: userAgent || 'Unknown device' },
    ])}
    ${featureList([
      'If this was not you, reset your password immediately.',
      'Avoid reusing passwords from other websites or apps.',
      'Use a private, trusted device when signing in to your account.',
    ])}
  `,
  ctaLabel: 'Reset My Password',
  ctaUrl: `${FRONTEND_URL}/auth/forgot-password`,
  secondaryCtaLabel: 'Open Account',
  secondaryCtaUrl: `${FRONTEND_URL}/account`,
});

exports.orderPlacedTemplate = ({ name, orderNumber, orderDate, items, total, shippingAddress, currency = 'NGN' }) => baseTemplate({
  title: `Order Received - ${orderNumber}`,
  preheader: 'We received your order and the team is preparing the next steps.',
  eyebrow: 'Order confirmed',
  heroTitle: `Order ${orderNumber} is in`,
  heroBody: 'Thank you for shopping with Revive Roots Essentials. We have received your order and will keep you updated as it moves through processing.',
  accentLabel: 'Processing started',
  introTitle: `Thank you, ${name || 'there'}.`,
  introBody: `Your order was received on ${orderDate || 'today'} and is now being prepared for confirmation and fulfillment.`,
  content: `
    ${renderOrderItems(items, currency)}
    ${infoCard('Order summary', [
      { label: 'Order number', value: orderNumber },
      { label: 'Order date', value: orderDate || 'Not available' },
      { label: 'Total', value: formatMoney(total, currency) },
      { label: 'Shipping address', value: shippingAddress || 'Not provided' },
    ])}
  `,
  ctaLabel: 'View My Orders',
  ctaUrl: `${FRONTEND_URL}/order-history`,
  secondaryCtaLabel: 'Continue Shopping',
  secondaryCtaUrl: `${FRONTEND_URL}/shop`,
});

exports.adminOrderAlertTemplate = ({ orderNumber, orderDate, customerName, customerEmail, items, total, shippingAddress, currency = 'NGN' }) => baseTemplate({
  title: `New Order Alert - ${orderNumber}`,
  preheader: 'A new customer order has been placed and needs admin visibility.',
  eyebrow: 'Admin order alert',
  heroTitle: `New order ${orderNumber}`,
  heroBody: 'A customer has placed a new order. Review the details below and follow the order through payment and fulfillment.',
  accentLabel: 'Admin notice',
  introTitle: 'A new order was placed.',
  introBody: 'This notification was sent to admin accounts so the team can monitor new orders and act quickly when needed.',
  content: `
    ${renderOrderItems(items, currency)}
    ${infoCard('Order summary', [
      { label: 'Order number', value: orderNumber },
      { label: 'Order date', value: orderDate || 'Not available' },
      { label: 'Customer', value: customerName || 'Unknown customer' },
      { label: 'Customer email', value: customerEmail || 'Not available' },
      { label: 'Total', value: formatMoney(total, currency) },
      { label: 'Shipping address', value: shippingAddress || 'Not provided' },
    ])}
  `,
  ctaLabel: 'Open Admin Panel',
  ctaUrl: `${FRONTEND_URL}/admin/orders`,
  secondaryCtaLabel: 'Open Dashboard',
  secondaryCtaUrl: `${FRONTEND_URL}/admin`,
});

exports.adminContactAlertTemplate = ({ name, email, subject, message, submittedAt }) => baseTemplate({
  title: `New Contact Message - ${APP_NAME}`,
  preheader: 'A customer submitted a new message from the contact form.',
  eyebrow: 'Admin contact alert',
  heroTitle: 'New contact message received',
  heroBody: 'A new customer inquiry was submitted from your website contact page. Review details below and follow up directly.',
  accentLabel: 'Action recommended',
  introTitle: 'A new contact request is available.',
  introBody: 'This message has been saved in your admin contact list and was also emailed to admin recipients.',
  content: `
    ${infoCard('Sender details', [
      { label: 'Name', value: name || 'Not provided' },
      { label: 'Email', value: email || 'Not provided' },
      { label: 'Submitted at', value: submittedAt || 'Not available' },
      { label: 'Subject', value: subject || 'No subject' },
    ])}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:18px 0 0 0;background:${BRAND.white};border:1px solid ${BRAND.line};border-radius:18px;">
      <tr>
        <td style="padding:18px 20px;">
          <p style="margin:0 0 10px 0;color:${BRAND.forest};font-size:12px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;">Message</p>
          <p style="margin:0;color:${BRAND.ink};font-size:14px;line-height:1.8;white-space:pre-wrap;">${e(message || 'No message content provided.')}</p>
        </td>
      </tr>
    </table>
  `,
  ctaLabel: 'Open Contact Messages',
  ctaUrl: `${FRONTEND_URL}/admin/contacts`,
  secondaryCtaLabel: 'Reply to Customer',
  secondaryCtaUrl: email ? `mailto:${email}` : `mailto:${SUPPORT_EMAIL}`,
});

exports.receiptTemplate = ({ name, orderNumber, paidAt, paymentMethod, items, total, currency = 'NGN' }) => baseTemplate({
  title: `Payment Receipt - ${orderNumber}`,
  preheader: 'Your payment was successful and your receipt is ready.',
  eyebrow: 'Payment confirmed',
  heroTitle: 'Your receipt is ready',
  heroBody: 'We have successfully confirmed your payment. Keep this email for your records and order reference.',
  accentLabel: 'Paid successfully',
  introTitle: `Payment received, ${name || 'there'}.`,
  introBody: 'Your payment has been logged successfully and your order is now moving to the next stage.',
  content: `
    ${renderOrderItems(items, currency)}
    ${infoCard('Payment summary', [
      { label: 'Order number', value: orderNumber },
      { label: 'Paid at', value: paidAt || 'Not available' },
      { label: 'Payment method', value: paymentMethod || 'Not specified' },
      { label: 'Amount paid', value: formatMoney(total, currency) },
    ])}
  `,
  ctaLabel: 'Track My Order',
  ctaUrl: `${FRONTEND_URL}/order-history`,
  secondaryCtaLabel: 'Shop More',
  secondaryCtaUrl: `${FRONTEND_URL}/shop`,
});

exports.paymentFailedTemplate = ({ name, orderNumber, attemptedAt, paymentMethod, items, total, reason, currency = 'NGN' }) => baseTemplate({
  title: `Payment Attempt Failed - ${orderNumber}`,
  preheader: 'Your payment attempt was not completed. You can retry securely.',
  eyebrow: 'Payment update',
  heroTitle: 'Payment was not completed',
  heroBody: 'Your payment attempt did not go through. No worries, your order is still available for retry.',
  accentLabel: 'Action needed',
  introTitle: `Hi ${name || 'there'},`,
  introBody: 'We could not complete payment for your order. Review the details below and try again when ready.',
  content: `
    ${renderOrderItems(items, currency)}
    ${infoCard('Payment attempt summary', [
      { label: 'Order number', value: orderNumber },
      { label: 'Attempted at', value: attemptedAt || 'Not available' },
      { label: 'Payment method', value: paymentMethod || 'Not specified' },
      { label: 'Order total', value: formatMoney(total, currency) },
      { label: 'Reason', value: reason || 'Payment attempt failed or was not confirmed.' },
    ])}
    ${featureList([
      'You can retry payment safely from your order history page.',
      'No successful charge is recorded until payment is confirmed.',
      'Contact support if you continue to see payment issues.',
    ])}
  `,
  ctaLabel: 'Retry Payment',
  ctaUrl: `${FRONTEND_URL}/order-history`,
  secondaryCtaLabel: 'Contact Support',
  secondaryCtaUrl: `${FRONTEND_URL}/contact`,
});

exports.orderStatusTemplate = ({ name, orderNumber, status, note }) => baseTemplate({
  title: `Order Status Updated - ${orderNumber}`,
  preheader: `Your order status is now ${formatStatus(status)}.`,
  eyebrow: 'Order update',
  heroTitle: `Your order is now ${formatStatus(status)}`,
  heroBody: 'We are keeping you informed as your order moves through each stage of fulfillment.',
  accentLabel: formatStatus(status),
  introTitle: `Update for ${name || 'you'}.`,
  introBody: `Order ${orderNumber} has been updated. Review the latest status and any note from our team below.`,
  content: `
    ${infoCard('Latest status', [
      { label: 'Order number', value: orderNumber },
      { label: 'Current status', value: formatStatus(status) },
      { label: 'Note', value: note || 'We will keep you updated until delivery is complete.' },
    ])}
  `,
  ctaLabel: 'View Order History',
  ctaUrl: `${FRONTEND_URL}/order-history`,
  secondaryCtaLabel: 'Contact Support',
  secondaryCtaUrl: `${FRONTEND_URL}/contact`,
});

exports.refundTemplate = ({ name, orderNumber, amount, reason, processedAt, currency = 'NGN' }) => baseTemplate({
  title: `Refund Processed - ${orderNumber}`,
  preheader: 'Your refund has been completed and recorded.',
  eyebrow: 'Refund complete',
  heroTitle: 'Your refund has been processed',
  heroBody: 'We have completed your refund and logged the details below for your reference.',
  accentLabel: 'Refund completed',
  introTitle: `Hello ${name || 'there'},`,
  introBody: 'Your refund has been finalized. Depending on your payment provider, settlement timing may vary slightly.',
  content: `
    ${infoCard('Refund summary', [
      { label: 'Order number', value: orderNumber },
      { label: 'Refund amount', value: formatMoney(amount, currency) },
      { label: 'Processed at', value: processedAt || 'Not available' },
      { label: 'Reason', value: reason || 'Processed by support' },
    ])}
    ${featureList([
      'Bank and card settlement times may vary after we process the refund.',
      'Keep this email for your records in case your provider asks for proof.',
      'Our support team can help if you need anything clarified.',
    ])}
  `,
  ctaLabel: 'Contact Support',
  ctaUrl: `${FRONTEND_URL}/contact`,
  secondaryCtaLabel: 'View Account',
  secondaryCtaUrl: `${FRONTEND_URL}/account`,
});

exports.refundStatusTemplate = ({
  name,
  orderNumber,
  status,
  requestedAmount,
  approvedAmount,
  reason,
  note,
  processedAt,
  currency = 'NGN',
}) => {
  const normalizedStatus = String(status || 'pending').toLowerCase();
  const statusCopy = {
    pending: {
      title: `Refund Request Received - ${orderNumber}`,
      preheader: 'We received your refund request and will review it shortly.',
      eyebrow: 'Refund update',
      heroTitle: 'Your refund request has been received',
      heroBody: 'Our team has logged your refund request and will review it as soon as possible.',
      accentLabel: 'Under review',
      introTitle: `Hello ${name || 'there'},`,
      introBody: 'You do not need to take any further action right now. We will send another email once the review is complete.',
    },
    approved: {
      title: `Refund Approved - ${orderNumber}`,
      preheader: 'Your refund request has been approved.',
      eyebrow: 'Refund approved',
      heroTitle: 'Your refund has been approved',
      heroBody: 'The request review is complete and the approved amount is now queued for processing.',
      accentLabel: 'Approved',
      introTitle: `Good news, ${name || 'there'}.`,
      introBody: 'Your refund request was approved. We will notify you again when the refund has been completed.',
    },
    rejected: {
      title: `Refund Update - ${orderNumber}`,
      preheader: 'Your refund request was not approved.',
      eyebrow: 'Refund update',
      heroTitle: 'Your refund request was not approved',
      heroBody: 'We reviewed your request and could not approve it in its current form.',
      accentLabel: 'Not approved',
      introTitle: `Hello ${name || 'there'},`,
      introBody: 'The review has been completed. If you need clarification, you can contact support with your order number.',
    },
    completed: {
      title: `Refund Completed - ${orderNumber}`,
      preheader: 'Your refund has been processed successfully.',
      eyebrow: 'Refund completed',
      heroTitle: 'Your refund is complete',
      heroBody: 'The approved refund has now been processed successfully.',
      accentLabel: 'Completed',
      introTitle: `Hello ${name || 'there'},`,
      introBody: 'Your refund is complete. Settlement timing may still depend on your payment provider.',
    },
  }[normalizedStatus] || {
    title: `Refund Update - ${orderNumber}`,
    preheader: 'There is an update to your refund request.',
    eyebrow: 'Refund update',
    heroTitle: 'There is an update to your refund',
    heroBody: 'We have an update on your refund request.',
    accentLabel: formatStatus(normalizedStatus),
    introTitle: `Hello ${name || 'there'},`,
    introBody: 'Review the latest update below.',
  };

  return baseTemplate({
    title: statusCopy.title,
    preheader: statusCopy.preheader,
    eyebrow: statusCopy.eyebrow,
    heroTitle: statusCopy.heroTitle,
    heroBody: statusCopy.heroBody,
    accentLabel: statusCopy.accentLabel,
    introTitle: statusCopy.introTitle,
    introBody: statusCopy.introBody,
    content: `
      ${infoCard('Refund summary', [
        { label: 'Order number', value: orderNumber },
        { label: 'Status', value: formatStatus(normalizedStatus) },
        { label: 'Requested amount', value: formatMoney(requestedAmount || approvedAmount || 0, currency) },
        ...(approvedAmount != null ? [{ label: 'Approved amount', value: formatMoney(approvedAmount, currency) }] : []),
        ...(processedAt ? [{ label: 'Updated at', value: processedAt }] : []),
        ...(reason ? [{ label: 'Reason', value: reason }] : []),
        ...(note ? [{ label: 'Note', value: note }] : []),
      ])}
    `,
    ctaLabel: 'Contact Support',
    ctaUrl: `${FRONTEND_URL}/contact`,
    secondaryCtaLabel: 'Open Account',
    secondaryCtaUrl: `${FRONTEND_URL}/account`,
  });
};

exports.weeklyNewsletterTemplate = ({ recipientName, products = [], unsubscribeUrl }) => {
  const intro = recipientName ? `Hello ${e(recipientName)},` : 'Hello there,';
  const cards = products.map((product) => `
    <tr>
      <td style="padding:0 0 18px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND.white};border:1px solid ${BRAND.line};border-radius:22px;overflow:hidden;">
          <tr>
            <td width="180" valign="top" style="padding:18px;">
              <img src="${e(product.imageUrl || LOGO_URL)}" alt="${e(product.name)}" width="144" style="display:block;width:144px;height:144px;object-fit:cover;border:0;border-radius:16px;background:${BRAND.cream};" />
            </td>
            <td valign="top" style="padding:18px 18px 18px 0;">
              <p style="margin:0 0 8px 0;color:${BRAND.forest};font-size:11px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;">This week's edit</p>
              <h3 style="margin:0 0 10px 0;color:${BRAND.ink};font-size:22px;line-height:1.3;">${e(product.name)}</h3>
              <p style="margin:0 0 12px 0;color:${BRAND.muted};font-size:14px;line-height:1.8;">${e(product.description || 'Premium hair and skincare support for a more intentional routine.')}</p>
              <p style="margin:0 0 16px 0;color:${BRAND.ink};font-size:18px;font-weight:800;">${formatMoney(product.price, 'NGN')}</p>
              <a href="${e(product.url)}" style="display:inline-block;background:${BRAND.ink};color:${BRAND.cream};text-decoration:none;padding:12px 18px;border-radius:14px;font-size:14px;font-weight:700;">View Product</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${e(APP_NAME)} Weekly Newsletter</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.sand};font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink};">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:linear-gradient(180deg, #f4ead1 0%, #ece3c7 100%);padding:28px 12px;">
      <tr>
        <td align="center">
          <table width="720" cellpadding="0" cellspacing="0" role="presentation" style="max-width:720px;background:${BRAND.white};border-radius:28px;overflow:hidden;border:1px solid ${BRAND.line};box-shadow:0 18px 40px rgba(16,33,23,0.08);">
            <tr>
              <td style="padding:28px 30px;background:linear-gradient(135deg, ${BRAND.ink} 0%, ${BRAND.forest} 60%, ${BRAND.moss} 100%);text-align:center;">
                <img src="${e(LOGO_URL)}" alt="${e(APP_NAME)}" width="64" height="64" style="display:block;margin:0 auto 14px auto;width:64px;height:64px;border-radius:18px;background:${BRAND.cream};padding:6px;" />
                <p style="margin:0;color:${BRAND.gold};font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Weekly luxury edit</p>
                <h1 style="margin:10px 0 12px 0;color:${BRAND.white};font-size:34px;line-height:1.15;">Fresh product picks for your routine</h1>
                <p style="margin:0 auto;color:rgba(255,255,255,0.84);font-size:15px;line-height:1.8;max-width:520px;">
                  ${intro} We pulled together our latest launches and standout essentials so your next routine refresh feels easy and elevated.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 30px 10px 30px;background:#fbf8ef;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  ${cards}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 30px 30px 30px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND.cream};border:1px solid ${BRAND.line};border-radius:20px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 10px 0;color:${BRAND.forest};font-size:12px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;">Stay in control</p>
                      <p style="margin:0;color:${BRAND.muted};font-size:13px;line-height:1.8;">
                        You are receiving this because you subscribed to updates from ${e(APP_NAME)}.
                        <a href="${e(unsubscribeUrl)}" style="color:${BRAND.forest};font-weight:700;text-decoration:none;">Unsubscribe</a>
                        at any time.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
};
