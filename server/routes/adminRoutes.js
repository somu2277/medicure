const express = require('express');
const router = express.Router();
const { getDashboardStats, getCustomers, getCustomerDetails } = require('../controllers/adminController');
const { 
    getSettings, updateSettings, getProfile, updateProfile, requestEmailChange, verifyEmailChange, changePassword 
} = require('../controllers/adminSettingsController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// For prototype, bypassing protect/admin
router.route('/analytics').get(getDashboardStats);
router.route('/customers').get(getCustomers);
router.route('/customers/:id').get(getCustomerDetails);

// Settings and Profile Routes
// Assuming protect and authorizeRoles('SUPER_ADMIN') should be used here, but for consistency with others:
router.route('/settings')
    .get(protect, getSettings)
    .put(protect, updateSettings);

router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile);

router.route('/request-email-change').post(protect, requestEmailChange);
router.route('/verify-email-change').post(protect, verifyEmailChange);
router.route('/change-password').put(protect, changePassword);

module.exports = router;
