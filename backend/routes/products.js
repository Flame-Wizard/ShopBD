const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, getAdminProducts, importProducts, bulkAction } = require('../controllers/productController');
const { protect, requireAdmin } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/admin/all', protect, requireAdmin, getAdminProducts);
router.post('/import', protect, requireAdmin, importProducts);
router.post('/bulk', protect, requireAdmin, bulkAction);
router.get('/:slug', getProductBySlug);
router.post('/', protect, requireAdmin, createProduct);
router.put('/:id', protect, requireAdmin, updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

module.exports = router;
