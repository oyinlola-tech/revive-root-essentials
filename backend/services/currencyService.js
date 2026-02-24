const axios = require('axios');

const COUNTRY_CACHE_MS = 10 * 60 * 1000;
const RATE_CACHE_MS = 30 * 60 * 1000;

let rateCache = { value: null, expiresAt: 0 };
const countryCache = new Map();

const normalizeIp = (ip = '') => {
  if (!ip) return '';
  if (ip.includes(',')) return ip.split(',')[0].trim();
  if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) return '';
  return ip.replace('::ffff:', '');
};

const getCountryFromIp = async (ip) => {
  const normalizedIp = normalizeIp(ip);
  if (!normalizedIp) return null;

  const cached = countryCache.get(normalizedIp);
  if (cached && cached.expiresAt > Date.now()) return cached.countryCode;

  try {
    const { data } = await axios.get(`https://ipapi.co/${normalizedIp}/json/`, { timeout: 4000 });
    const countryCode = (data?.country_code || '').toUpperCase() || null;
    countryCache.set(normalizedIp, { countryCode, expiresAt: Date.now() + COUNTRY_CACHE_MS });
    return countryCode;
  } catch (error) {
    return null;
  }
};

const getNgnToUsdRate = async () => {
  if (rateCache.value && rateCache.expiresAt > Date.now()) return rateCache.value;
  try {
    const { data } = await axios.get('https://open.er-api.com/v6/latest/NGN', { timeout: 4000 });
    const rate = Number(data?.rates?.USD);
    if (!rate || Number.isNaN(rate)) throw new Error('Invalid conversion rate');
    rateCache = { value: rate, expiresAt: Date.now() + RATE_CACHE_MS };
    return rate;
  } catch (error) {
    return 0.00067;
  }
};

const convertNgnToUsdWithBuffer = (ngnValue, rate) => {
  const converted = Number(ngnValue) * rate;
  return Number((converted + 1).toFixed(2));
};

const getPricingContext = async (req) => {
  const forcedCountry = String(req.headers['x-country-code'] || '').toUpperCase();
  const countryCode = forcedCountry || await getCountryFromIp(req.ip);
  const useUsd = Boolean(countryCode && countryCode !== 'NG');

  if (!useUsd) {
    return { countryCode: countryCode || 'NG', useUsd: false, rate: null, currency: 'NGN' };
  }

  const rate = await getNgnToUsdRate();
  return { countryCode, useUsd: true, rate, currency: 'USD' };
};

module.exports = {
  getPricingContext,
  getNgnToUsdRate,
  convertNgnToUsdWithBuffer,
};

