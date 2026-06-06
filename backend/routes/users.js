const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, toggleBan, toggleWishlist, updateAddresses, changePassword } = require('../controllers/userController');
const { protect, requireAdmin } = require('../middleware/auth');

router.get('/', protect, requireAdmin, getUsers);
router.get('/:id', protect, requireAdmin, getUserById);
router.put('/me/wishlist/:productId', protect, toggleWishlist);
router.put('/me/addresses', protect, updateAddresses);
router.put('/me/password', protect, changePassword);
router.put('/:id', protect, requireAdmin, updateUser);
router.put('/:id/toggle-ban', protect, requireAdmin, toggleBan);
router.delete('/:id', protect, requireAdmin, deleteUser);

module.exports = router;
