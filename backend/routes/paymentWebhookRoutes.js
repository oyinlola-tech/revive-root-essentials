const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.post(
  '/orders/flutterwave/webhook',
  express.raw({ type: 'application/json', limit: '1mb' }),
  orderController.handleFlutterwaveWebhook,
);

module.exports = router;
