const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
const rateLimit = require('./middlewares/rateLimitMiddleware');
const requestLoggingMiddleware = require('./middlewares/requestLoggingMiddleware');
const {
  additionalSecurityHeadersMiddleware,
  suspiciousActivityDetectionMiddleware,
} = require('./middlewares/securityMiddleware');
const Logger = require('./utils/Logger');

// Load backend-specific env first, then allow root-level .env as fallback.
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const logger = new Logger('App');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentWebhookRoutes = require('./routes/paymentWebhookRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const refundRoutes = require('./routes/refundRoutes');
const couponRoutes = require('./routes/couponRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const auditRoutes = require('./routes/auditRoutes');

const errorHandler = require('./middlewares/errorMiddleware');

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = configuredOrigins.length > 0
  ? configuredOrigins
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests. Please try again shortly.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many authentication attempts. Try again later.',
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many contact submissions. Please try again later.',
});

const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many newsletter subscriptions. Please try again later.',
});

const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many orders. Please try again shortly.',
});

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: process.env.NODE_ENV === 'production'
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
}));
app.use(additionalSecurityHeadersMiddleware);
app.use(globalLimiter);
app.use(suspiciousActivityDetectionMiddleware);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Currency', 'X-Country-Code', 'X-CSRF-Token'],
  credentials: false,
}));
app.use(compression());
app.use('/api', paymentWebhookRoutes);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(requestLoggingMiddleware);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=86400');
  },
}));

// Routes
app.use('/api/auth', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderLimiter);
app.use('/api/orders', orderRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contact', contactLimiter);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterLimiter);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/shipping-fees', require('./routes/shippingRoutes'));
app.use('/api/admin', adminRoutes);
app.use('/api/admin/audit-logs', auditRoutes);
app.use((error, req, res, next) => {
  if (error && error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: true, message: 'Invalid JSON payload' });
  }
  return next(error);
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API version endpoint
app.get('/api/version', (req, res) => {
  res.status(200).json({
    version: '1.0.0',
    api: 'v1',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: true, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
