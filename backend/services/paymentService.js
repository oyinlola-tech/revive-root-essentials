const axios = require('axios');
const crypto = require('crypto');
const Flutterwave = require('flutterwave-node-v3');
const config = require('../config/payment');

class PaymentService {
  constructor() {
    this.baseURL = config.baseUrl;
    this.secretKey = config.secretKey;
    this.publicKey = config.publicKey;
    this.webhookSecretHash = String(process.env.FLW_WEBHOOK_SECRET_HASH || '').trim();
    const defaultCurrencies = [
      'GBP', 'CAD', 'XAF', 'COP', 'EGP', 'EUR', 'GHS', 'KES', 'IRN', 'NGN',
      'RWF', 'SLL', 'ZAR', 'TZS', 'UGX', 'USD', 'XOF', 'ZMW',
    ];
    this.allowedCurrencies = (process.env.ALLOWED_PAYMENT_CURRENCIES || defaultCurrencies.join(','))
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    this.allowedRedirectHosts = new Set(
      [process.env.FRONTEND_URL]
        .filter(Boolean)
        .map((url) => {
          try { return new URL(url).host; } catch { return null; }
        })
        .filter(Boolean),
    );
    this.flw = this.publicKey && this.secretKey
      ? new Flutterwave(this.publicKey, this.secretKey)
      : null;
  }

  // Initialize a transaction (charge)
  async initiateTransaction({ amount, email, currency, reference, callbackUrl, paymentMethod }) {
    if (!this.secretKey || !this.publicKey) {
      throw new Error('Payment keys are not configured');
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new Error('Invalid amount for payment');
    }

    const normalizedCurrency = String(currency || 'NGN').toUpperCase();
    if (!this.allowedCurrencies.includes(normalizedCurrency)) {
      throw new Error(`Currency ${normalizedCurrency} is not allowed for payments`);
    }

    if (callbackUrl) {
      try {
        const callbackHost = new URL(callbackUrl).host;
        if (this.allowedRedirectHosts.size && !this.allowedRedirectHosts.has(callbackHost)) {
          throw new Error(`Callback host ${callbackHost} not allowed`);
        }
      } catch (error) {
        throw new Error('Invalid payment callback URL');
      }
    }

    try {
      const paymentOptionMap = {
        card: 'card',
        ussd: 'ussd',
        transfer: 'banktransfer',
      };
      const paymentOptions = paymentOptionMap[paymentMethod];
      if (!paymentOptions) {
        throw new Error('Unsupported payment method');
      }

      const response = await axios.post(
        `${this.baseURL}/payments`,
        {
          tx_ref: reference,
          amount: numericAmount,
          currency: normalizedCurrency,
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
      if (this.flw?.Transaction) {
        return await this.flw.Transaction.verify({ id: Number(transactionId) || transactionId });
      }

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

  // Verify transaction by reference (tx_ref)
  async verifyTransactionByReference(txRef) {
    try {
      if (this.flw?.Transaction) {
        return await this.flw.Transaction.verify_by_tx({ tx_ref: txRef });
      }

      const response = await axios.get(
        `${this.baseURL}/transactions/verify_by_reference`,
        {
          params: { tx_ref: txRef },
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(`Flutterwave verification by reference failed: ${error.response?.data?.message || error.message}`);
    }
  }

  verifyWebhookSignature(signatureHeader = '') {
    const incoming = String(signatureHeader || '').trim();
    const expected = this.webhookSecretHash;
    if (!incoming || !expected) return false;

    const incomingBuffer = Buffer.from(incoming);
    const expectedBuffer = Buffer.from(expected);
    if (incomingBuffer.length !== expectedBuffer.length) return false;

    return crypto.timingSafeEqual(incomingBuffer, expectedBuffer);
  }
}

module.exports = new PaymentService();
