const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ success: true, coupons });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) { res.status(404); throw new Error('Invalid coupon code'); }
  if (coupon.expiresAt < new Date()) { res.status(400); throw new Error('Coupon has expired'); }
  if (coupon.usedCount >= coupon.usageLimit) { res.status(400); throw new Error('Coupon usage limit reached'); }
  if (orderTotal < coupon.minOrderValue) { res.status(400); throw new Error(`Minimum order value is ৳${coupon.minOrderValue}`); }

  const discount = coupon.type === 'percentage' ? (orderTotal * coupon.value) / 100 : coupon.value;
  res.json({ success: true, coupon, discount: Math.min(discount, orderTotal) });
});

module.exports = { createCoupon, getCoupons, deleteCoupon, validateCoupon };
