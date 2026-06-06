const express = require('express');
const router = express.Router();
const { createCoupon, getCoupons, deleteCoupon, validateCoupon } = require('../controllers/couponController');
const { protect, requireAdmin } = require('../middleware/auth');

router.get('/', protect, requireAdmin, getCoupons);
router.post('/', protect, requireAdmin, createCoupon);
router.post('/validate', protect, validateCoupon);
router.delete('/:id', protect, requireAdmin, deleteCoupon);

module.exports = router;
