const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const sendEmail = require('../config/email');

// @route  POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, shippingMethod, coupon, discount, notes, salesChannel, location } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items in order');
  }

  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) continue;
    const price = product.salePrice || product.price;
    subtotal += price * item.qty;
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0] || '',
      qty: item.qty,
      variant: item.variant || '',
      price,
    });
    // Update stock and units sold
    product.stock = Math.max(0, product.stock - item.qty);
    product.unitsSold += item.qty;
    await product.save();
  }

  const shippingCost = shippingMethod === 'Express' ? 150 : shippingMethod === 'Standard' ? 80 : 0;
  const tax = 0;
  const totalPrice = subtotal + shippingCost + tax - (discount || 0);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'Cash on Delivery',
    shippingMethod,
    subtotal,
    tax,
    shippingCost,
    totalPrice,
    coupon,
    discount: discount || 0,
    notes,
    salesChannel: salesChannel || 'Online Store',
    location: location || shippingAddress?.city || 'Dhaka',
  });

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  // Send confirmation email
  try {
    await sendEmail({
      to: req.user.email,
      subject: `ShopBD — Order Confirmed #${order._id.toString().slice(-8).toUpperCase()}`,
      html: `
        <h2>Thank you for your order!</h2>
        <p>Order ID: <strong>${order._id}</strong></p>
        <p>Total: <strong>৳${totalPrice.toFixed(0)}</strong></p>
        <p>Payment: <strong>${paymentMethod || 'Cash on Delivery'}</strong></p>
        <p>We'll process your order shortly.</p>
      `,
    });
  } catch {}

  res.status(201).json({ success: true, order });
});

// @route  GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('items.product', 'name slug images');
  res.json({ success: true, orders });
});

// @route  GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name slug images price');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  // Only admin or order owner
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role === 'customer') {
    res.status(403);
    throw new Error('Access denied');
  }
  res.json({ success: true, order });
});

// @route  GET /api/orders (admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, customer, dateFrom, dateTo } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;
  if (customer) filter['shippingAddress.fullName'] = { $regex: customer, $options: 'i' };
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort('-createdAt')
    .populate('user', 'name email')
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @route  PUT /api/orders/:id/status (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (orderStatus === 'Delivered') order.deliveredAt = new Date();
  if (paymentStatus === 'Paid') order.paidAt = new Date();

  await order.save();
  res.json({ success: true, order });
});

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
