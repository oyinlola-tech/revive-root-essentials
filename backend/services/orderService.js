const { Order, OrderItem, Product, CartItem, sequelize } = require('../models');
const { generateOrderNumber } = require('../utils/orderUtils'); // we'll create below
const AppError = require('../utils/AppError');
const shippingService = require('./shippingService');
const currencyService = require('./currencyService');

class OrderService {
  async createOrder(userId, orderData, items, pricingContext = { currency: 'NGN', rate: 1 }) {
    const transaction = await sequelize.transaction();
    try {
      // Calculate total and verify stock
      let subtotal = 0;
      const orderItems = [];
      const targetCurrency = pricingContext.currency || 'NGN';
      const conversionRate = pricingContext.rate || 1;
      const useConversion = targetCurrency !== 'NGN';

      for (const item of items) {
        const product = await Product.findByPk(item.productId, { transaction });
        if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
        if (product.stock < item.quantity) throw new AppError(`Insufficient stock for ${product.name}`, 400);

        const basePrice = Number(product.price);
        const unitPrice = useConversion
          ? currencyService.convertNgnToCurrencyWithBuffer(basePrice, conversionRate)
          : basePrice;
        const itemTotal = unitPrice * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: unitPrice,
        });

        // Reduce stock
        product.stock -= item.quantity;
        await product.save({ transaction });
      }

      const shippingQuote = await shippingService.getShippingFee(orderData.shippingAddress, pricingContext);
      const total = subtotal + Number(shippingQuote.fee || 0);

      // Create order
      const orderNumber = generateOrderNumber();
      const order = await Order.create({
        orderNumber,
        userId,
        totalAmount: total,
        shippingFee: shippingQuote.fee,
        currency: targetCurrency,
        paymentMethod: orderData.paymentMethod,
        shippingAddress: orderData.shippingAddress,
        status: 'pending',
        paymentStatus: 'pending',
      }, { transaction });

      // Create order items
      for (const item of orderItems) {
        await OrderItem.create({
          ...item,
          orderId: order.id,
        }, { transaction });
      }

      // Clear user's cart
      await CartItem.destroy({ where: { userId }, transaction });

      await transaction.commit();
      return order;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new OrderService();
