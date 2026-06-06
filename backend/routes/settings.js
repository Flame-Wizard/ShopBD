const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, requireAdmin } = require('../middleware/auth');

router.get('/', protect, requireAdmin, getSettings);
router.put('/', protect, requireAdmin, updateSettings);

module.exports = router;
