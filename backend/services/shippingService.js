const { Op } = require('sequelize');
const { ShippingFee } = require('../models');
const currencyService = require('./currencyService');

const normalize = (value) => String(value || '').trim().toLowerCase();

class ShippingService {
  async getShippingFee(shippingAddress, pricingContext = { currency: 'NGN', rate: 1 }) {
    const country = normalize(shippingAddress?.country);
    const state = normalize(shippingAddress?.state);
    const city = normalize(shippingAddress?.city);

    const allRules = await ShippingFee.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
    });

    const bestRule = allRules.find((rule) => {
      const rc = normalize(rule.country);
      const rs = normalize(rule.state);
      const rcity = normalize(rule.city);

      if (rcity && rcity !== city) return false;
      if (rs && rs !== state) return false;
      if (rc && rc !== country) return false;
      return true;
    });

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
