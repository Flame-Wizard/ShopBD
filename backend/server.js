require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const reviewRoutes = require('./routes/reviews');
const couponRoutes = require('./routes/coupons');
const analyticsRoutes = require('./routes/analytics');
const settingsRoutes = require('./routes/settings');

// Connect to DB
connectDB().then(async () => {
  try {
    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('📦 Database is empty. Running auto-seeding...');
      const { seed } = require('./utils/seeder');
      await seed();
      console.log('✅ Auto-seeding completed.');
    }
  } catch (err) {
    console.error('❌ Auto-seeding error:', err);
  }
});

const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later' },
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ShopBD API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Info (for Bizanolytics integration)
app.get('/api/analytics-info', (req, res) => {
  res.json({
    success: true,
    info: {
      name: 'ShopBD Analytics API',
      baseUrl: `http://localhost:${process.env.PORT || 5000}/api/analytics`,
      authMethod: 'x-api-key header or ?apiKey= query param',
      apiKeyEnvVar: 'ANALYTICS_API_KEY',
      endpoints: {
        sales: 'GET /api/analytics/sales',
        overview: 'GET /api/analytics/overview',
        revenueTrend: 'GET /api/analytics/revenue-trend',
        topProducts: 'GET /api/analytics/top-products',
        byCategory: 'GET /api/analytics/by-category',
        byLocation: 'GET /api/analytics/by-location',
        byChannel: 'GET /api/analytics/by-channel',
        inventory: 'GET /api/analytics/inventory',
      },
      requiredColumns: ['Date', 'Product_Name', 'Category', 'Location', 'Sales_Channel', 'Units_Sold', 'Revenue_BDT', 'Cost_Price', 'Current_Stock'],
    },
  });
});

// Mount routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ShopBD API running on http://localhost:${PORT}`);
  console.log(`📊 Analytics API: http://localhost:${PORT}/api/analytics/sales`);
  console.log(`🔑 Analytics Key: ${process.env.ANALYTICS_API_KEY}`);
  console.log(`📖 API Info: http://localhost:${PORT}/api/analytics-info`);
});
