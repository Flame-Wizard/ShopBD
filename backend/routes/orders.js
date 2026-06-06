const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, requireAdmin } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/', protect, requireAdmin, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, requireAdmin, updateOrderStatus);

module.exports = router;
