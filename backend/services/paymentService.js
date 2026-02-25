const axios = require('axios');
const config = require('../config/payment');

class PaymentService {
  constructor() {
    this.baseURL = config.baseUrl;
    this.secretKey = config.secretKey;
    this.publicKey = config.publicKey;
  }

  // Initialize a transaction (charge)
  async initiateTransaction({ amount, email, currency, reference, callbackUrl, paymentMethod }) {
    try {
      const paymentOptionMap = {
        card: 'card',
        ussd: 'ussd',
        transfer: 'banktransfer',
      };
      const paymentOptions = paymentOptionMap[paymentMethod] || undefined;

      const response = await axios.post(
        `${this.baseURL}/payments`,
        {
          tx_ref: reference,
          amount: Number(amount),
          currency: currency || 'NGN',
          redirect_url: callbackUrl,
          customer: {
            email,
          },
          payment_options: paymentOptions,
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
      throw new Error(`Flutterwave payment initiation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Verify transaction
  async verifyTransaction(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transactions/${transactionId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Flutterwave verification failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Handle webhook (to be called by Flutterwave)
  handleWebhook(payload, signature) {
    // Verify signature using your secret key (if provided by Flutterwave)
    // Then update order status based on payload
    return payload;
  }
}

module.exports = new PaymentService();
