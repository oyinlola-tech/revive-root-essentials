const APP_NAME = 'Revive Roots Essentials';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://revive-root-essentials.telente.site';

const BRAND_PRIMARY = '#052012';
const BRAND_ACCENT = '#e3e1bb';
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

const baseTemplate = ({ title, preheader, content, ctaLabel, ctaUrl }) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${e(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND_ACCENT};font-family:Arial,Helvetica,sans-serif;color:${BRAND_PRIMARY};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${e(preheader)}</div>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND_ACCENT};padding:24px 0;">
      <tr>
        <td align="center">
          <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid rgba(5,32,18,0.15);">
            <tr>
              <td style="background:${BRAND_PRIMARY};padding:20px 28px;">
                <h1 style="margin:0;color:${BRAND_ACCENT};font-size:20px;letter-spacing:0.3px;">${APP_NAME}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${content}
                ${ctaUrl ? `<p style="margin:24px 0 6px 0;"><a href="${ctaUrl}" style="display:inline-block;background:${BRAND_PRIMARY};color:${BRAND_ACCENT};text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">${ctaLabel || 'Continue'}</a></p>` : ''}
                <p style="margin-top:24px;font-size:13px;line-height:1.6;color:#4b5a51;">
                  If you did not expect this email, contact us at ${process.env.SUPPORT_EMAIL || 'support@reviverootsessentials.com'}.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:${BRAND_ACCENT};color:${BRAND_PRIMARY};font-size:12px;line-height:1.6;">
                ${APP_NAME} - Premium hair and skin essentials for healthy routines.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const renderOrderItems = (items = [], currency = 'NGN') => {
  if (!items.length) return '<p style="margin:0;">No items available.</p>';
  const rows = items.map((item) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid rgba(5,32,18,0.12);">${e(item.name || 'Product')}</td>
      <td style="padding:10px 8px;border-bottom:1px solid rgba(5,32,18,0.12);" align="center">${item.quantity || 1}</td>
      <td style="padding:10px 8px;border-bottom:1px solid rgba(5,32,18,0.12);" align="right">${formatMoney(item.price, currency)}</td>
    </tr>
  `).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;font-size:14px;">
      <thead>
        <tr>
          <th align="left" style="padding:8px;border-bottom:2px solid rgba(5,32,18,0.2);">Item</th>
          <th align="center" style="padding:8px;border-bottom:2px solid rgba(5,32,18,0.2);">Qty</th>
          <th align="right" style="padding:8px;border-bottom:2px solid rgba(5,32,18,0.2);">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

exports.otpTemplate = ({ name, code, channel = 'email', expiresMinutes = 5, verificationUrl }) => baseTemplate({
  title: `Your ${APP_NAME} Verification Code`,
  preheader: 'Use this one-time code to complete your request.',
  content: `
    <h2 style="margin:0 0 10px 0;font-size:24px;">Verification Code</h2>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;">Hi ${name || 'there'}, use the code below to continue your ${APP_NAME} ${channel} verification.</p>
    <div style="margin:12px 0 18px 0;padding:18px;border:1px dashed ${BRAND_PRIMARY};border-radius:10px;background:${BRAND_ACCENT};text-align:center;">
      <span style="font-size:34px;font-weight:800;letter-spacing:8px;color:${BRAND_PRIMARY};">${e(code)}</span>
    </div>
    <p style="margin:0 0 12px 0;font-size:14px;color:#4b5a51;">This code expires in ${expiresMinutes} minutes. Do not share it with anyone.</p>
    ${verificationUrl ? '<p style="margin:0;font-size:14px;color:#4b5a51;">If the code does not work or you prefer not to type it, use the verification button below.</p>' : ''}
  `,
  ctaLabel: verificationUrl ? 'Verify My Email' : undefined,
  ctaUrl: verificationUrl,
});

exports.welcomeTemplate = ({ name }) => baseTemplate({
  title: `Welcome to ${APP_NAME}`,
  preheader: 'Your account is ready. Start exploring products now.',
  content: `
    <h2 style="margin:0 0 10px 0;font-size:24px;">Welcome, ${name || 'friend'}.</h2>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;">Your account is active. You can now browse hair and skin products, save favorites, and checkout faster.</p>
    <ul style="margin:0 0 14px 18px;padding:0;color:${BRAND_PRIMARY};line-height:1.8;">
      <li>Discover curated hair and skincare products</li>
      <li>Track your orders and account updates</li>
      <li>Manage your preferences from one dashboard</li>
    </ul>
  `,
  ctaLabel: 'Start Shopping',
  ctaUrl: `${FRONTEND_URL}/shop`,
});

exports.loginAlertTemplate = ({ name, ipAddress, userAgent, time }) => baseTemplate({
  title: `New Login Detected - ${APP_NAME}`,
  preheader: 'A new sign-in was detected on your account.',
  content: `
    <h2 style="margin:0 0 10px 0;font-size:24px;">Security Alert</h2>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;">Hi ${name || 'there'}, a new login was detected on your account.</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND_ACCENT};border:1px solid rgba(5,32,18,0.12);border-radius:8px;padding:12px;font-size:14px;">
      <tr><td style="padding:6px 0;"><strong>Time:</strong> ${time}</td></tr>
      <tr><td style="padding:6px 0;"><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</td></tr>
      <tr><td style="padding:6px 0;"><strong>Device:</strong> ${userAgent || 'Unknown device'}</td></tr>
    </table>
    <p style="margin:14px 0 0 0;font-size:14px;line-height:1.7;color:#4b5a51;">If this was not you, reset your password immediately.</p>
  `,
  ctaLabel: 'Secure My Account',
  ctaUrl: `${FRONTEND_URL}/auth/forgot-password`,
});

exports.orderPlacedTemplate = ({ name, orderNumber, orderDate, items, total, shippingAddress, currency = 'NGN' }) => baseTemplate({
  title: `Order Received - ${orderNumber}`,
  preheader: 'Your order has been received and is now being processed.',
  content: `
    <h2 style="margin:0 0 10px 0;font-size:24px;">Order Confirmed</h2>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;">Hi ${e(name || 'there')}, we received your order <strong>${e(orderNumber)}</strong> on ${e(orderDate)}.</p>
    ${renderOrderItems(items, currency)}
    <p style="margin:14px 0 6px 0;font-size:15px;"><strong>Total:</strong> ${formatMoney(total, currency)}</p>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#4b5a51;"><strong>Shipping Address:</strong> ${e(shippingAddress || 'Not provided')}</p>
  `,
  ctaLabel: 'View Orders',
  ctaUrl: `${FRONTEND_URL}/account`,
});

exports.receiptTemplate = ({ name, orderNumber, paidAt, paymentMethod, items, total, currency = 'NGN' }) => baseTemplate({
  title: `Payment Receipt - ${orderNumber}`,
  preheader: 'Your payment was successful.',
  content: `
    <h2 style="margin:0 0 10px 0;font-size:24px;">Payment Successful</h2>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;">Hi ${e(name || 'there')}, your payment for <strong>${e(orderNumber)}</strong> has been confirmed.</p>
    <p style="margin:0 0 12px 0;font-size:14px;line-height:1.7;color:#4b5a51;"><strong>Paid at:</strong> ${e(paidAt)}<br /><strong>Method:</strong> ${e(paymentMethod || 'N/A')}</p>
    ${renderOrderItems(items, currency)}
    <p style="margin:14px 0 0 0;font-size:15px;"><strong>Amount Paid:</strong> ${formatMoney(total, currency)}</p>
  `,
  ctaLabel: 'Track My Order',
  ctaUrl: `${FRONTEND_URL}/account`,
});

exports.orderStatusTemplate = ({ name, orderNumber, status, note }) => baseTemplate({
  title: `Order Status Updated - ${orderNumber}`,
  preheader: `Your order status is now ${status}.`,
  content: `
    <h2 style="margin:0 0 10px 0;font-size:24px;">Order Status Update</h2>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;">Hi ${e(name || 'there')}, your order <strong>${e(orderNumber)}</strong> is now <strong style="text-transform:uppercase;">${e(status)}</strong>.</p>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#4b5a51;">${e(note || 'We will keep you updated until delivery is complete.')}</p>
  `,
  ctaLabel: 'View My Orders',
  ctaUrl: `${FRONTEND_URL}/account`,
});

exports.refundTemplate = ({ name, orderNumber, amount, reason, processedAt, currency = 'NGN' }) => baseTemplate({
  title: `Refund Processed - ${orderNumber}`,
  preheader: 'Your refund has been completed.',
  content: `
    <h2 style="margin:0 0 10px 0;font-size:24px;">Refund Completed</h2>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;">Hello ${e(name || 'there')}, your refund for order <strong>${e(orderNumber)}</strong> has been processed.</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND_ACCENT};border:1px solid rgba(5,32,18,0.12);border-radius:8px;padding:12px;font-size:14px;">
      <tr><td style="padding:6px 0;"><strong>Refund Amount:</strong> ${formatMoney(amount, currency)}</td></tr>
      <tr><td style="padding:6px 0;"><strong>Processed At:</strong> ${e(processedAt)}</td></tr>
      <tr><td style="padding:6px 0;"><strong>Reason:</strong> ${e(reason || 'Refund processed by support team')}</td></tr>
    </table>
  `,
  ctaLabel: 'Contact Support',
  ctaUrl: `${FRONTEND_URL}/contact`,
});

exports.weeklyNewsletterTemplate = ({ recipientName, products = [], unsubscribeUrl }) => {
  const intro = recipientName ? `Hello ${e(recipientName)},` : 'Hello there,';
  const rows = products.map((product) => `
    <tr>
      <td style="padding:20px;border-bottom:1px solid rgba(5,32,18,0.12);">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="120" valign="top" style="padding-right:16px;">
              <img src="${e(product.imageUrl || '')}" alt="${e(product.name)}" width="120" style="display:block;width:120px;height:120px;object-fit:cover;border:0;border-radius:8px;" />
            </td>
            <td valign="top">
              <h3 style="margin:0 0 8px 0;color:${BRAND_PRIMARY};font-size:18px;line-height:1.4;">${e(product.name)}</h3>
              <p style="margin:0 0 10px 0;color:${BRAND_PRIMARY};font-size:15px;line-height:1.6;">${e(product.description || 'Premium hair and skin essentials designed for visible results.')}</p>
              <p style="margin:0 0 14px 0;color:${BRAND_PRIMARY};font-size:16px;font-weight:700;">${formatMoney(product.price, 'NGN')}</p>
              <a href="${e(product.url)}" style="display:inline-block;padding:10px 18px;background:${BRAND_PRIMARY};color:${BRAND_ACCENT};text-decoration:none;font-weight:700;font-size:13px;border-radius:8px;">View Product</a>
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
    <title>${APP_NAME} Weekly Newsletter</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND_ACCENT};font-family:Arial,Helvetica,sans-serif;color:${BRAND_PRIMARY};">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND_ACCENT};padding:28px 0;">
      <tr>
        <td align="center">
          <table width="680" cellpadding="0" cellspacing="0" role="presentation" style="max-width:680px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid rgba(5,32,18,0.15);">
            <tr>
              <td style="background:${BRAND_PRIMARY};padding:28px 34px;text-align:center;">
                <p style="margin:0;color:${BRAND_ACCENT};font-size:12px;letter-spacing:2px;text-transform:uppercase;">Weekly Hair & Skin Edit</p>
                <h1 style="margin:10px 0 0 0;color:${BRAND_ACCENT};font-size:30px;line-height:1.2;">${APP_NAME}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 34px 20px 34px;">
                <p style="margin:0 0 14px 0;font-size:18px;line-height:1.7;">${intro}</p>
                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.8;">Here are this week's latest products for your hair and skincare routine. Prices are listed in Nigerian Naira.</p>
              </td>
            </tr>
            ${rows}
            <tr>
              <td style="padding:24px 34px;background:${BRAND_ACCENT};">
                <p style="margin:0 0 12px 0;font-size:14px;line-height:1.8;color:${BRAND_PRIMARY};">Need help choosing products? Our support team can guide your routine.</p>
                <p style="margin:0;font-size:12px;line-height:1.8;color:${BRAND_PRIMARY};">
                  You are receiving this because you opted in for updates.
                  <a href="${e(unsubscribeUrl)}" style="color:${BRAND_PRIMARY};text-decoration:underline;">Unsubscribe</a>
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
};
