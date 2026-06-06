const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }
    if (!req.user.isActive) {
      res.status(403);
      throw new Error('Account has been banned');
    }
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized — invalid token');
  }
});

const requireAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied — admin only');
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied — superadmin only');
  }
};

// Analytics API key middleware (for Bizanolytics)
const requireAnalyticsKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  if (apiKey && apiKey === process.env.ANALYTICS_API_KEY) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Invalid analytics API key' });
  }
};

module.exports = { protect, requireAdmin, requireSuperAdmin, requireAnalyticsKey };
