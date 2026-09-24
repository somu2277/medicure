const express = require('express');
const router = express.Router();
const { getDashboardStats, getCustomers } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// For prototype, bypassing protect/admin
router.route('/analytics').get(getDashboardStats);
router.route('/customers').get(getCustomers);

module.exports = router;
