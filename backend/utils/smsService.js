const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const isConfigured = Boolean(accountSid && authToken && fromNumber);
const client = isConfigured ? twilio(accountSid, authToken) : null;

const sendSms = async (to, body) => {
  if (!isConfigured) {
    throw new Error('SMS service is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.');
  }
  return client.messages.create({
    body,
    from: fromNumber,
    to,
  });
};

module.exports = { sendSms, isConfigured };

