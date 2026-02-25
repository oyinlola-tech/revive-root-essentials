module.exports = {
  publicKey: process.env.FLW_PUBLIC_KEY,
  secretKey: process.env.FLW_SECRET_KEY,
  baseUrl: process.env.FLW_BASE_URL || 'https://api.flutterwave.com/v3',
};
