const express = require('express');
const router = express.Router();
const { createReview, getProductReviews, getAllReviews, approveReview, deleteReview } = require('../controllers/reviewController');
const { protect, requireAdmin } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/admin/all', protect, requireAdmin, getAllReviews);
router.get('/product/:id', getProductReviews);
router.put('/:id/approve', protect, requireAdmin, approveReview);
router.delete('/:id', protect, requireAdmin, deleteReview);

module.exports = router;
