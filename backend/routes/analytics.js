const express = require('express');
const router = express.Router();
const {
  getSalesData, getOverview, getRevenueTrend, getTopProducts,
  getSalesByCategory, getSalesByLocation, getSalesByChannel, getInventory
} = require('../controllers/analyticsController');
const { protect, requireAdmin, requireAnalyticsKey } = require('../middleware/auth');

// All analytics routes accept either:
// 1. Admin JWT token (for in-app dashboard)
// 2. x-api-key header (for Bizanolytics external connection)
const adminOrApiKey = (req, res, next) => {
  // Try API key first
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  if (apiKey && apiKey === process.env.ANALYTICS_API_KEY) {
    return next();
  }
  // Fall back to JWT admin auth
  protect(req, res, () => requireAdmin(req, res, next));
};

router.get('/sales', adminOrApiKey, getSalesData);
router.get('/overview', adminOrApiKey, getOverview);
router.get('/revenue-trend', adminOrApiKey, getRevenueTrend);
router.get('/top-products', adminOrApiKey, getTopProducts);
router.get('/by-category', adminOrApiKey, getSalesByCategory);
router.get('/by-location', adminOrApiKey, getSalesByLocation);
router.get('/by-channel', adminOrApiKey, getSalesByChannel);
router.get('/inventory', adminOrApiKey, getInventory);

module.exports = router;
