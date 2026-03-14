const { Op } = require('sequelize');
const { ShippingFee } = require('../models');
const AppError = require('../utils/AppError');
const currencyService = require('./currencyService');

const normalize = (value) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim().toLowerCase();
  }
  return '';
};
const INTERNATIONAL_RULE_TOKEN = '__international__';
const NIGERIA = 'nigeria';

class ShippingService {
  async getShippingFee(shippingAddress, pricingContext = { currency: 'NGN', rate: 1 }) {
    const country = normalize(shippingAddress?.country);
    const state = normalize(shippingAddress?.state);
    const city = normalize(shippingAddress?.city);

    const allRules = await ShippingFee.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
    });

    // 1) Most specific country rule (city > state > country)
    const countryRules = allRules.filter((rule) => {
      const rc = normalize(rule.country);
      if (!rc || rc === INTERNATIONAL_RULE_TOKEN) return false;
      if (rc !== country) return false;
      return true;
    });

    const bestCountryRule = countryRules.find((rule) => {
      const rs = normalize(rule.state);
      const rcity = normalize(rule.city);

      if (rcity && rcity !== city) return false;
      if (country === NIGERIA && rs && rs !== state) return false;
      return true;
    });

    // 2) Fallback rule for countries not explicitly configured
    const bestInternationalRule = allRules.find((rule) => {
      const rc = normalize(rule.country);
      if (rc !== INTERNATIONAL_RULE_TOKEN) return false;
      const rs = normalize(rule.state);
      const rcity = normalize(rule.city);
      if (rcity && rcity !== city) return false;
      if (rs && rs !== state) return false;
      return true;
    });

    const bestRule = bestCountryRule || bestInternationalRule;
    if (!bestRule) {
      throw new AppError('No shipping fee configured for this destination', 400);
    }

    const baseFee = Number(bestRule?.fee || 0);
    let fee = baseFee;
    const currency = pricingContext.currency || 'NGN';
    if (currency !== 'NGN') {
      const rate = pricingContext.rate || await currencyService.getNgnToCurrencyRate(currency);
      fee = Number((baseFee * rate).toFixed(2));
    }

    return {
      fee,
      currency,
      matchedRuleId: bestRule?.id || null,
    };
  }
}

module.exports = new ShippingService();
