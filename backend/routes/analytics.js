const express = require('express');
const router = express.Router();
const {
  getBizanalyticsProducts,
  getSalesData, getOverview, getRevenueTrend, getTopProducts,
  getSalesByCategory, getSalesByLocation, getSalesByChannel, getInventory
} = require('../controllers/analyticsController');
const { protect, requireAdmin, requireAnalyticsKey } = require('../middleware/auth');

// All analytics routes accept either:
// 1. Admin JWT token (for in-app dashboard)
// 2. x-api-key header (legacy)
// 3. Authorization: Bearer <api_key> (used by Bizanolytics "Your Website" integration)
const adminOrApiKey = (req, res, next) => {
  const ANALYTICS_KEY = process.env.ANALYTICS_API_KEY;

  // Check x-api-key header (legacy / direct curl)
  const xApiKey = req.headers['x-api-key'] || req.query.apiKey;
  if (xApiKey && xApiKey === ANALYTICS_KEY) return next();

  // Check Authorization: Bearer <api_key>  ← Bizanolytics sends this
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.split(' ')[1];
    if (bearerToken === ANALYTICS_KEY) return next();
  }

  // Fall back to JWT admin auth (in-app dashboard)
  protect(req, res, () => requireAdmin(req, res, next));
};

// ─── Bizanolytics "Your Website" integration endpoint ───────────────────────
// Returns: { products: [{id, name, price, category, stock, reviewCount, rating}], endpointUrl }
// Use THIS URL in Bizanolytics → Integrations → Your Website → API Endpoint URL
router.get('/products', adminOrApiKey, getBizanalyticsProducts);

// ─── Internal analytics endpoints ───────────────────────────────────────────
router.get('/sales', adminOrApiKey, getSalesData);
router.get('/overview', adminOrApiKey, getOverview);
router.get('/revenue-trend', adminOrApiKey, getRevenueTrend);
router.get('/top-products', adminOrApiKey, getTopProducts);
router.get('/by-category', adminOrApiKey, getSalesByCategory);
router.get('/by-location', adminOrApiKey, getSalesByLocation);
router.get('/by-channel', adminOrApiKey, getSalesByChannel);
router.get('/inventory', adminOrApiKey, getInventory);

module.exports = router;

