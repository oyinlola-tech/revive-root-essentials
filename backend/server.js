const express = require('express');
const cors = require('cors');
// Make sure to import other necessary modules like dotenv, morgan, etc.

// Import your route handlers
const analyticsRoutes = require('./routes/analyticsRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const contactRoutes = require('./routes/contactRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
// ... import all other routes

const app = express();

// --- CORS Configuration ---
// Define the whitelist of allowed origins. This is more secure than allowing all origins.
const allowedOrigins = [
  'https://revive-root-essentials.telente.site',
  // You can add your local development origin here as well
  'http://localhost:3000',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Allow cookies and authorization headers
  optionsSuccessStatus: 200 // For legacy browser support
};

// Enable CORS for all routes with the specified options.
// This middleware MUST be placed before your route definitions.
app.use(cors(corsOptions));

// --- Other Middleware ---
app.use(express.json()); // for parsing application/json

// --- API Routes ---
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
// ... and so on for all your other routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});