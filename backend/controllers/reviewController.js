const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');

const createReview = asyncHandler(async (req, res) => {
  const { product, rating, comment } = req.body;
  const existing = await Review.findOne({ user: req.user._id, product });
  if (existing) { res.status(400); throw new Error('You already reviewed this product'); }

  const review = await Review.create({ user: req.user._id, product, rating, comment });
  // Update product average
  const reviews = await Review.find({ product, isApproved: true });
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);
  await Product.findByIdAndUpdate(product, { averageRating: avg.toFixed(1), numReviews: reviews.length });
  res.status(201).json({ success: true, review });
});

const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.id, isApproved: true })
    .populate('user', 'name avatar').sort('-createdAt');
  res.json({ success: true, reviews });
});

const getAllReviews = asyncHandler(async (req, res) => {
  const { isApproved, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('user', 'name email')
    .populate('product', 'name slug')
    .sort('-createdAt')
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
  res.json({ success: true, reviews, total });
});

const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!review) { res.status(404); throw new Error('Review not found'); }
  const reviews = await Review.find({ product: review.product, isApproved: true });
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);
  await Product.findByIdAndUpdate(review.product, { averageRating: avg.toFixed(1), numReviews: reviews.length });
  res.json({ success: true, review });
});

const deleteReview = asyncHandler(async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Review deleted' });
});

module.exports = { createReview, getProductReviews, getAllReviews, approveReview, deleteReview };
