const sequelize = require('../config/database');
const User = require('./User')(sequelize);
const Otp = require('./Otp')(sequelize);
const Product = require('./Product')(sequelize);
const Category = require('./Category')(sequelize);
const CartItem = require('./CartItem')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);
const Review = require('./Review')(sequelize);
const Contact = require('./Contact')(sequelize);
const Newsletter = require('./Newsletter')(sequelize);
const ShippingFee = require('./ShippingFee')(sequelize);
const NewsletterCampaignLog = require('./NewsletterCampaignLog')(sequelize);
const WishlistItem = require('./WishlistItem')(sequelize);
const Coupon = require('./Coupon')(sequelize);
const Inventory = require('./Inventory')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);
const RefundRequest = require('./RefundRequest')(sequelize);

// Associations
// User <-> Otp
User.hasMany(Otp, { foreignKey: 'userId', onDelete: 'CASCADE' });
Otp.belongsTo(User, { foreignKey: 'userId' });

// Category <-> Product
Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// User <-> CartItem
User.hasMany(CartItem, { foreignKey: 'userId', onDelete: 'CASCADE' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

// Product <-> CartItem
Product.hasMany(CartItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

// User <-> Order
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'SET NULL' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Product <-> OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// User <-> Review
User.hasMany(Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId' });

// Product <-> Review
Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// User <-> WishlistItem
User.hasMany(WishlistItem, { foreignKey: 'userId', onDelete: 'CASCADE' });
WishlistItem.belongsTo(User, { foreignKey: 'userId' });

// Product <-> WishlistItem
Product.hasMany(WishlistItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
WishlistItem.belongsTo(Product, { foreignKey: 'productId' });

// User <-> Coupon (createdBy relationship)
User.hasMany(Coupon, { foreignKey: 'createdBy', onDelete: 'SET NULL' });
Coupon.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Product <-> Inventory
Product.hasOne(Inventory, { foreignKey: 'productId', onDelete: 'CASCADE' });
Inventory.belongsTo(Product, { foreignKey: 'productId' });

// User <-> AuditLog
User.hasMany(AuditLog, { foreignKey: 'userId', onDelete: 'SET NULL' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

// Order <-> RefundRequest
Order.hasMany(RefundRequest, { foreignKey: 'orderId', onDelete: 'CASCADE' });
RefundRequest.belongsTo(Order, { foreignKey: 'orderId' });

// User <-> RefundRequest (requestor and processor)
User.hasMany(RefundRequest, { foreignKey: 'userId', onDelete: 'SET NULL', as: 'refundRequests' });
RefundRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(RefundRequest, { foreignKey: 'processedBy', onDelete: 'SET NULL', as: 'processedRefunds' });
RefundRequest.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

module.exports = {
  sequelize,
  User,
  Otp,
  Product,
  Category,
  CartItem,
  Order,
  OrderItem,
  Review,
  Contact,
  Newsletter,
  NewsletterCampaignLog,
  ShippingFee,
  WishlistItem,
  Coupon,
  Inventory,
  AuditLog,
  RefundRequest,
};
