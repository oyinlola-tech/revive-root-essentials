const axios = require('axios');
const { ensureRedisConnection } = require('../config/redis');

const COUNTRY_CACHE_MS = 10 * 60 * 1000;
const RATE_CACHE_MS = 30 * 60 * 1000;

const SUPPORTED_CHARGE_CURRENCIES = new Set([
  'GBP',
  'CAD',
  'XAF',
  'COP',
  'EGP',
  'EUR',
  'GHS',
  'KES',
  'IRN',
  'NGN',
  'RWF',
  'SLL',
  'ZAR',
  'TZS',
  'UGX',
  'USD',
  'XOF',
  'ZMW',
]);

let rateCache = { value: null, expiresAt: 0 };
const countryCache = new Map();

const normalizeIp = (ip = '') => {
  if (!ip) return '';
  if (ip.includes(',')) return ip.split(',')[0].trim();
  const normalizedIp = ip.replace('::ffff:', '');
  if (
    normalizedIp === '::1'
    || normalizedIp.startsWith('127.')
    || normalizedIp.startsWith('192.168.')
    || normalizedIp.startsWith('10.')
  ) return '';
  return normalizedIp;
};

const getCountryFromIp = async (ip) => {
  const normalizedIp = normalizeIp(ip);
  if (!normalizedIp) return null;

  const redis = await ensureRedisConnection();
  if (redis) {
    try {
      const cachedCountry = await redis.get(`geo:country:${normalizedIp}`);
      if (cachedCountry) return cachedCountry;
    } catch (error) {
      // Continue with fallback caches.
    }
  }

  const cached = countryCache.get(normalizedIp);
  if (cached && cached.expiresAt > Date.now()) return cached.countryCode;

  try {
    const { data } = await axios.get(`https://ipapi.co/${normalizedIp}/json/`, { timeout: 4000 });
    const countryCode = (data?.country_code || '').toUpperCase() || null;
    countryCache.set(normalizedIp, { countryCode, expiresAt: Date.now() + COUNTRY_CACHE_MS });
    if (redis && countryCode) {
      try {
        await redis.set(`geo:country:${normalizedIp}`, countryCode, 'EX', Math.floor(COUNTRY_CACHE_MS / 1000));
      } catch (error) {
        // Ignore cache write errors.
      }
    }
    return countryCode;
  } catch (error) {
    return null;
  }
};

const getNgnRates = async () => {
  const redis = await ensureRedisConnection();
  if (redis) {
    try {
      const cachedRates = await redis.get('fx:NGN');
      if (cachedRates) return JSON.parse(cachedRates);
    } catch (error) {
      // Continue with fallback caches.
    }
  }

  if (rateCache.value && rateCache.expiresAt > Date.now()) return rateCache.value;
  try {
    const { data } = await axios.get('https://open.er-api.com/v6/latest/NGN', { timeout: 4000 });
    const rates = data?.rates || null;
    if (!rates || typeof rates !== 'object') throw new Error('Invalid conversion rates');
    rateCache = { value: rates, expiresAt: Date.now() + RATE_CACHE_MS };
    if (redis) {
      try {
        await redis.set('fx:NGN', JSON.stringify(rates), 'EX', Math.floor(RATE_CACHE_MS / 1000));
      } catch (error) {
        // Ignore cache write errors.
      }
    }
    return rates;
  } catch (error) {
    return null;
  }
};

const getNgnToCurrencyRate = async (currency) => {
  const normalized = String(currency || '').trim().toUpperCase();
  if (!normalized) return null;
  if (normalized === 'NGN') return 1;
  const rates = await getNgnRates();
  const rate = Number(rates?.[normalized]);
  if (!rate || Number.isNaN(rate)) return null;
  return rate;
};

const convertNgnToUsdWithBuffer = (ngnValue, rate) => {
  return convertNgnToCurrencyWithBuffer(ngnValue, rate);
};

const convertNgnToCurrency = (ngnValue, rate) => {
  const base = Number(ngnValue);
  const conversionRate = Number(rate);
  if (!conversionRate || Number.isNaN(base) || Number.isNaN(conversionRate)) return 0;
  return Number((base * conversionRate).toFixed(2));
};

const convertNgnToCurrencyWithBuffer = (ngnValue, rate) => {
  const conversionRate = Number(rate);
  const addNgnBuffer = conversionRate !== 1 ? 1000 : 0;
  return convertNgnToCurrency(Number(ngnValue) + addNgnBuffer, conversionRate);
};

const getConvertedBaseFee = (currency, rate, ngnBaseFee = 1000) => {
  const normalized = String(currency || 'NGN').toUpperCase();
  if (normalized === 'NGN') return 0;
  return convertNgnToCurrency(ngnBaseFee, rate);
};

const isSupportedChargeCurrency = (currency) => SUPPORTED_CHARGE_CURRENCIES.has(currency);

const getPricingContext = async (req, requestedCurrency = '') => {
  const forcedCountry = String(req.headers['x-country-code'] || '').toUpperCase();
  const countryCode = forcedCountry || await getCountryFromIp(req.ip);
  const headerCurrency = String(req.headers['x-currency'] || '').trim();
  const queryCurrency = String(req.query?.currency || '').trim();
  const normalizedCurrency = String(requestedCurrency || headerCurrency || queryCurrency || '').trim().toUpperCase();

  if (normalizedCurrency) {
    if (!isSupportedChargeCurrency(normalizedCurrency)) {
      return { countryCode: countryCode || 'NG', currency: 'NGN', rate: null, invalidCurrency: normalizedCurrency };
    }

    if (normalizedCurrency === 'NGN') {
      return { countryCode: countryCode || 'NG', currency: 'NGN', rate: 1, invalidCurrency: null };
    }

    const rate = await getNgnToCurrencyRate(normalizedCurrency);
    return { countryCode, currency: normalizedCurrency, rate, invalidCurrency: null };
  }

  const useUsd = Boolean(countryCode && countryCode !== 'NG');

  if (!useUsd) {
    return { countryCode: countryCode || 'NG', currency: 'NGN', rate: 1, invalidCurrency: null };
  }

  const rate = await getNgnToCurrencyRate('USD');
  return { countryCode, currency: 'USD', rate, invalidCurrency: null };
};

module.exports = {
  getPricingContext,
  getNgnToUsdRate: async () => getNgnToCurrencyRate('USD'),
  getNgnToCurrencyRate,
  convertNgnToCurrency,
  convertNgnToUsdWithBuffer,
  convertNgnToCurrencyWithBuffer,
  getConvertedBaseFee,
  isSupportedChargeCurrency,
  SUPPORTED_CHARGE_CURRENCIES,
};
