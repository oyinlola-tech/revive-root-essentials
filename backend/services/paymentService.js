const axios = require('axios');
const config = require('../config/payment');

class PaymentService {
  constructor() {
    this.baseURL = config.baseUrl;
    this.secretKey = config.secretKey;
    this.publicKey = config.publicKey;
    this.merchantId = config.merchantId;
  }

  // Initialize a transaction (charge)
  async initiateTransaction({ amount, email, currency, reference, callbackUrl }) {
    try {
      const response = await axios.post(
        `${this.baseURL}/transaction/initiate`,
        {
          amount,
          email,
          currency: currency || 'NGN',
          reference,
          callback_url: callbackUrl,
          merchant_id: this.merchantId,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Squad payment initiation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Verify transaction
  async verifyTransaction(reference) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Squad verification failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Handle webhook (to be called by Squad)
  handleWebhook(payload, signature) {
    // Verify signature using your secret key (if provided by Squad)
    // Then update order status based on payload
    return payload;
  }
}

module.exports = new PaymentService();