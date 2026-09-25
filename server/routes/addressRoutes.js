const express = require('express');
const {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All address routes are protected

router.route('/')
    .get(getAddresses)
    .post(createAddress);

router.route('/:id')
    .put(updateAddress)
    .delete(deleteAddress);

router.route('/:id/default')
    .put(setDefaultAddress);

module.exports = router;
