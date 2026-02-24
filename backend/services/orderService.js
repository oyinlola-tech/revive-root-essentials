const { Order, OrderItem, Product, CartItem, sequelize } = require('../models');
const { generateOrderNumber } = require('../utils/orderUtils'); // we'll create below
const AppError = require('../utils/AppError');

class OrderService {
  async createOrder(userId, orderData, items) {
    const transaction = await sequelize.transaction();
    try {
      // Calculate total and verify stock
      let total = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findByPk(item.productId, { transaction });
        if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
        if (product.stock < item.quantity) throw new AppError(`Insufficient stock for ${product.name}`, 400);

        const itemTotal = product.price * item.quantity;
        total += itemTotal;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });

        // Reduce stock
        product.stock -= item.quantity;
        await product.save({ transaction });
      }

      // Create order
      const orderNumber = generateOrderNumber();
      const order = await Order.create({
        orderNumber,
        userId,
        totalAmount: total,
        currency: 'USD', // or derive from items? For simplicity we assume USD
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

  // other methods: updateStatus, cancelOrder, etc.
}

module.exports = new OrderService();