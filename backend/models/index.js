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
};
