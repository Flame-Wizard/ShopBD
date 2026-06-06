const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * ANALYTICS API — For Bizanolytics Integration
 * Authentication: x-api-key header, Bearer token, or ?apiKey= query param
 * API Key is defined in .env as ANALYTICS_API_KEY
 *
 * Base URL: https://shopbd-ncaz.onrender.com/api/analytics
 *
 * Endpoints:
 *  GET /api/analytics/products        — Bizanolytics "Your Website" integration endpoint
 *                                       Returns: { products: [{id, name, price, category, stock, reviewCount, rating}], endpointUrl }
 *  GET /api/analytics/sales          — sales rows (Date, Product_Name, Category, Location, Sales_Channel, Units_Sold, Revenue_BDT, Cost_Price, Current_Stock)
 *  GET /api/analytics/overview       — KPI summary (total revenue, orders, customers, products)
 *  GET /api/analytics/revenue-trend  — daily/weekly/monthly revenue
 *  GET /api/analytics/top-products   — top-selling products
 *  GET /api/analytics/by-category    — sales grouped by category
 *  GET /api/analytics/by-location    — sales grouped by location
 *  GET /api/analytics/by-channel     — sales grouped by sales channel
 */

/**
 * @route  GET /api/analytics/products
 * @desc   Bizanolytics "Your Website" integration endpoint.
 *         Returns products in the exact shape that Bizanolytics's normalizeCustom() reads:
 *         { products: [{id, name, price, category, stock, reviewCount, rating}], endpointUrl }
 */
const getBizanalyticsProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isPublished: true })
    .populate('category', 'name')
    .select('name sku category stock price salePrice costPrice unitsSold averageRating reviewCount images')
    .limit(500);

  const endpointUrl = `${req.protocol}://${req.get('host')}/api/analytics/products`;

  res.json({
    products: products.map((p) => ({
      id: p.sku || p._id.toString(),
      name: p.name,
      price: p.salePrice || p.price,
      category: p.category?.name || 'Uncategorized',
      stock: typeof p.stock === 'number' ? p.stock : null,
      reviewCount: typeof p.reviewCount === 'number' ? p.reviewCount : (typeof p.unitsSold === 'number' ? p.unitsSold : null),
      rating: typeof p.averageRating === 'number' ? p.averageRating : null,
    })),
    endpointUrl,
    // Also expose meta for transparency
    meta: {
      source: 'ShopBD',
      currency: 'BDT',
      totalProducts: products.length,
      generatedAt: new Date().toISOString(),
    },
  });
});

// @route  GET /api/analytics/sales
// Returns rows matching the required columns for Bizanolytics
const getSalesData = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, category, location, salesChannel, limit = 1000 } = req.query;

  const filter = { orderStatus: { $ne: 'Cancelled' } };
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
  }
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (salesChannel) filter.salesChannel = salesChannel;

  const orders = await Order.find(filter)
    .populate({
      path: 'items.product',
      select: 'name category brand costPrice stock',
      populate: { path: 'category', select: 'name' },
    })
    .sort('-createdAt')
    .limit(Number(limit));

  // Flatten to row-per-product-per-order format
  const rows = [];
  for (const order of orders) {
    for (const item of order.items) {
      const product = item.product;
      rows.push({
        Date: order.createdAt.toISOString().split('T')[0],
        Order_ID: order._id.toString(),
        Product_Name: item.name || (product?.name ?? 'Unknown'),
        Category: product?.category?.name || 'Uncategorized',
        Location: order.location || 'Dhaka',
        Sales_Channel: order.salesChannel || 'Online Store',
        Units_Sold: item.qty,
        Revenue_BDT: item.price * item.qty,
        Cost_Price: product?.costPrice || 0,
        Current_Stock: product?.stock ?? 0,
        Order_Status: order.orderStatus,
        Payment_Method: order.paymentMethod,
        Payment_Status: order.paymentStatus,
      });
    }
  }

  res.json({
    success: true,
    count: rows.length,
    data: rows,
    meta: {
      columns: ['Date', 'Order_ID', 'Product_Name', 'Category', 'Location', 'Sales_Channel', 'Units_Sold', 'Revenue_BDT', 'Cost_Price', 'Current_Stock', 'Order_Status', 'Payment_Method', 'Payment_Status'],
      currency: 'BDT',
      timezone: 'Asia/Dhaka',
      generated_at: new Date().toISOString(),
    },
  });
});


// @route  GET /api/analytics/overview
const getOverview = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  const filter = { orderStatus: { $ne: 'Cancelled' } };
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  const [totalRevenue, totalOrders, totalCustomers, totalProducts, pendingOrders] = await Promise.all([
    Order.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.countDocuments(filter),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments({ isPublished: true }),
    Order.countDocuments({ orderStatus: 'Pending' }),
  ]);

  res.json({
    success: true,
    data: {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
    },
  });
});

// @route  GET /api/analytics/revenue-trend
const getRevenueTrend = asyncHandler(async (req, res) => {
  const { period = 'daily', days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  const groupBy = period === 'monthly'
    ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
    : period === 'weekly'
    ? { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } }
    : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };

  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, orderStatus: { $ne: 'Cancelled' } } },
    { $group: { _id: groupBy, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  res.json({ success: true, period, data });
});

// @route  GET /api/analytics/top-products
const getTopProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const products = await Product.find()
    .sort('-unitsSold')
    .limit(Number(limit))
    .populate('category', 'name')
    .select('name unitsSold price salePrice stock averageRating images category costPrice');

  res.json({
    success: true,
    data: products.map((p) => ({
      Product_Name: p.name,
      Category: p.category?.name || '',
      Units_Sold: p.unitsSold,
      Revenue_BDT: p.unitsSold * (p.salePrice || p.price),
      Cost_Price: p.costPrice,
      Current_Stock: p.stock,
      Rating: p.averageRating,
      Image: p.images[0] || '',
    })),
  });
});

// @route  GET /api/analytics/by-category
const getSalesByCategory = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'Cancelled' } } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productData',
      },
    },
    { $unwind: { path: '$productData', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'categories',
        localField: 'productData.category',
        foreignField: '_id',
        as: 'categoryData',
      },
    },
    { $unwind: { path: '$categoryData', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$categoryData.name',
        Revenue_BDT: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
        Units_Sold: { $sum: '$items.qty' },
        Orders: { $sum: 1 },
      },
    },
    { $sort: { Revenue_BDT: -1 } },
  ]);

  res.json({ success: true, data: data.map((d) => ({ Category: d._id || 'Uncategorized', ...d, _id: undefined })) });
});

// @route  GET /api/analytics/by-location
const getSalesByLocation = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: '$location',
        Revenue_BDT: { $sum: '$totalPrice' },
        Orders: { $sum: 1 },
        Units_Sold: { $sum: { $sum: '$items.qty' } },
      },
    },
    { $sort: { Revenue_BDT: -1 } },
  ]);
  res.json({ success: true, data: data.map((d) => ({ Location: d._id, ...d, _id: undefined })) });
});

// @route  GET /api/analytics/by-channel
const getSalesByChannel = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: '$salesChannel',
        Revenue_BDT: { $sum: '$totalPrice' },
        Orders: { $sum: 1 },
      },
    },
    { $sort: { Revenue_BDT: -1 } },
  ]);
  res.json({ success: true, data: data.map((d) => ({ Sales_Channel: d._id, ...d, _id: undefined })) });
});

// @route  GET /api/analytics/inventory
const getInventory = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .populate('category', 'name')
    .select('name sku category stock costPrice price salePrice unitsSold isPublished');

  res.json({
    success: true,
    data: products.map((p) => ({
      Product_Name: p.name,
      SKU: p.sku,
      Category: p.category?.name || '',
      Current_Stock: p.stock,
      Cost_Price: p.costPrice,
      Selling_Price: p.salePrice || p.price,
      Units_Sold: p.unitsSold,
      Status: p.stock === 0 ? 'Out of Stock' : p.stock < 10 ? 'Low Stock' : 'In Stock',
      Is_Published: p.isPublished,
    })),
  });
});

module.exports = {
  getBizanalyticsProducts,
  getSalesData,
  getOverview,
  getRevenueTrend,
  getTopProducts,
  getSalesByCategory,
  getSalesByLocation,
  getSalesByChannel,
  getInventory,
};

