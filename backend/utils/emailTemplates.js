const APP_NAME = 'Revive Roots Essentials';

const baseTemplate = ({ title, preheader, content, ctaLabel, ctaUrl }) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f1ed;font-family:Arial,Helvetica,sans-serif;color:#2e2a27;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ed;padding:24px 0;">
      <tr>
        <td align="center">
          <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e7dfd8;">
            <tr>
              <td style="background:#201a16;padding:22px 28px;">
                <h1 style="margin:0;color:#fff6ef;font-size:20px;letter-spacing:0.4px;">${APP_NAME}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${content}
                ${ctaUrl ? `<p style="margin:24px 0 4px 0;"><a href="${ctaUrl}" style="display:inline-block;background:#201a16;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700;">${ctaLabel || 'Continue'}</a></p>` : ''}
                <p style="margin-top:24px;font-size:13px;line-height:1.6;color:#6d625b;">
                  If you did not expect this email, please contact our support team immediately at ${process.env.SUPPORT_EMAIL || 'support@reviverootsessentials.com'}.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#faf7f4;color:#7b6f67;font-size:12px;line-height:1.6;">
                ${APP_NAME} · Natural skincare essentials crafted with care.<br />
                This message was sent automatically, please do not reply directly.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const renderOrderItems = (items = []) => {
  if (items.length === 0) return '<p style="margin:0;">No items available.</p>';
  const rows = items.map((item) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #efe8e2;">${item.name || 'Product'}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #efe8e2;" align="center">${item.quantity || 1}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #efe8e2;" align="right">$${Number(item.price || 0).toFixed(2)}</td>
    </tr>
  `).join('');
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
      <thead>
        <tr>
          <th align="left" style="padding:8px;border-bottom:2px solid #d8cbc1;">Item</th>
          <th align="center" style="padding:8px;border-bottom:2px solid #d8cbc1;">Qty</th>
          <th align="right" style="padding:8px;border-bottom:2px solid #d8cbc1;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

exports.otpTemplate = ({ name, code, channel = 'email', expiresMinutes = 5 }) => baseTemplate({
  title: `Your ${APP_NAME} Verification Code`,
  preheader: 'Use your one-time verification code to continue securely.',
  content: `
    <h2 style="margin:0 0 10px 0;font-size:24px;">Verification Required</h2>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;">Hi ${name || 'there'}, we received a request to verify your identity on your ${APP_NAME} account using ${channel}.</p>
    <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;">Please use the one-time code below. It expires in <strong>${expiresMinutes} minutes</strong> and can only be used once.</p>
    <div style="margin:12px 0 18px 0;padding:18px;border:1px dashed #bca999;border-radius:10px;background:#fff9f4;text-align:center;">
      <span style="font-size:34px;font-weight:800;letter-spacing:8px;color:#1f1a16;">${code}</span>
    </div>
    <p style="margin:0;font-size:14px;color:#6d625b;">For your protection, never share this code with anyone, including support agents.</p>
  `,
});

exports.welcomeTemplate = ({ name }) => baseTemplate({
  title: `Welcome to ${APP_NAME}`,
  preheader: 'Your account is ready and your skincare journey starts now.',
  content: `
    <h2 style="margin:0 0 10px 0;font-size:24px;">Welcome, ${name || 'friend'}!</h2>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;">Your account has been successfully verified. You now have full access to curated natural skincare essentials, your order dashboard, and priority support.</p>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;">To get the best results, start by exploring product details, ingredient guidance, and usage instructions tailored to each formula.</p>
    <ul style="margin:0 0 14px 18px;padding:0;color:#4e443e;line-height:1.8;">
      <li>Track purchases and delivery updates</li>
      <li>Review your favorite products</li>
      <li>Save future purchases with fast checkout</li>
    </ul>
    <p style="margin:0;font-size:14px;color:#6d625b;">We are glad to have you with us.</p>
  `,
  ctaLabel: 'Start Shopping',
  ctaUrl: `${process.env.FRONTEND_URL || ''}/shop`,
});

exports.loginAlertTemplate = ({ name, ipAddress, userAgent, time }) => baseTemplate({
  title: `New Login Detected - ${APP_NAME}`,
  preheader: 'A new login was detected on your account.',
  content: `
    <h2 style="margin:0 0 10px 0;font-size:24px;">New Login Activity</h2>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;">Hi ${name || 'there'}, your account was just signed in successfully.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f4;border:1px solid #ece2d9;border-radius:8px;padding:12px;font-size:14px;">
      <tr><td style="padding:6px 0;"><strong>Time:</strong> ${time}</td></tr>
      <tr><td style="padding:6px 0;"><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</td></tr>
      <tr><td style="padding:6px 0;"><strong>Device:</strong> ${userAgent || 'Unknown device'}</td></tr>
    </table>
    <p style="margin:14px 0 0 0;font-size:14px;line-height:1.7;color:#6d625b;">If this was not you, reset your password immediately and contact support.</p>
  `,
  ctaLabel: 'Secure My Account',
  ctaUrl: `${process.env.FRONTEND_URL || ''}/forgot-password`,
});

exports.orderPlacedTemplate = ({ name, orderNumber, orderDate, items, total, shippingAddress }) => baseTemplate({
  title: `Order Received - ${orderNumber}`,
  preheader: 'Your order has been received and is being prepared.',
  content: `
    <h2 style="margin:0 0 10px 0;font-size:24px;">Thanks for your order, ${name || 'there'}.</h2>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;">We have received your order <strong>${orderNumber}</strong> on ${orderDate}. Our team is now preparing your items for processing.</p>
    ${renderOrderItems(items)}
    <p style="margin:14px 0 6px 0;font-size:15px;"><strong>Total:</strong> $${Number(total || 0).toFixed(2)}</p>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#6d625b;"><strong>Shipping Address:</strong> ${shippingAddress || 'Not provided'}</p>
  `,
  ctaLabel: 'View Order',
  ctaUrl: `${process.env.FRONTEND_URL || ''}/orders`,
});

exports.receiptTemplate = ({ name, orderNumber, paidAt, paymentMethod, items, total }) => baseTemplate({
  title: `Payment Receipt - ${orderNumber}`,
  preheader: 'Your payment was successful and receipt is attached in this email content.',
  content: `
    <h2 style="margin:0 0 10px 0;font-size:24px;">Payment Confirmed</h2>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;">Hi ${name || 'there'}, we have successfully received your payment for <strong>${orderNumber}</strong>.</p>
    <p style="margin:0 0 12px 0;font-size:14px;line-height:1.7;color:#5b4f47;"><strong>Paid at:</strong> ${paidAt}<br /><strong>Method:</strong> ${paymentMethod || 'N/A'}</p>
    ${renderOrderItems(items)}
    <p style="margin:14px 0 0 0;font-size:15px;"><strong>Amount Paid:</strong> $${Number(total || 0).toFixed(2)}</p>
  `,
  ctaLabel: 'Track My Order',
  ctaUrl: `${process.env.FRONTEND_URL || ''}/orders`,
});

exports.orderStatusTemplate = ({ name, orderNumber, status, note }) => baseTemplate({
  title: `Order Status Updated - ${orderNumber}`,
  preheader: `Your order status is now ${status}.`,
  content: `
    <h2 style="margin:0 0 10px 0;font-size:24px;">Order Update</h2>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;">Hi ${name || 'there'}, your order <strong>${orderNumber}</strong> has been updated.</p>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;">Current status: <strong style="text-transform:uppercase;">${status}</strong></p>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#6d625b;">${note || 'We will continue to keep you informed as your order progresses.'}</p>
  `,
  ctaLabel: 'View Order',
  ctaUrl: `${process.env.FRONTEND_URL || ''}/orders`,
});

exports.refundTemplate = ({ name, orderNumber, amount, reason, processedAt }) => baseTemplate({
  title: `Refund Processed - ${orderNumber}`,
  preheader: 'Your refund has been successfully processed.',
  content: `
    <h2 style="margin:0 0 10px 0;font-size:24px;">Refund Completed</h2>
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;">Hello ${name || 'there'}, your refund for order <strong>${orderNumber}</strong> has been processed.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f4;border:1px solid #ece2d9;border-radius:8px;padding:12px;font-size:14px;">
      <tr><td style="padding:6px 0;"><strong>Refund Amount:</strong> $${Number(amount || 0).toFixed(2)}</td></tr>
      <tr><td style="padding:6px 0;"><strong>Processed At:</strong> ${processedAt}</td></tr>
      <tr><td style="padding:6px 0;"><strong>Reason:</strong> ${reason || 'Refund requested by support team'}</td></tr>
    </table>
    <p style="margin:14px 0 0 0;font-size:14px;line-height:1.7;color:#6d625b;">Depending on your bank or payment provider, funds may take 3-10 business days to reflect.</p>
  `,
  ctaLabel: 'Contact Support',
  ctaUrl: `${process.env.FRONTEND_URL || ''}/contact`,
});
