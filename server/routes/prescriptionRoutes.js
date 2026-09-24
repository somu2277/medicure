const express = require('express');
const router = express.Router();
const { uploadPrescription, getPrescriptions, updatePrescriptionStatus } = require('../controllers/prescriptionController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .post(protect, upload.single('prescription'), uploadPrescription)
    .get(protect, getPrescriptions);

router.route('/:id/status')
    .patch(protect, authorizeRoles('SUPER_ADMIN', 'PHARMACIST'), updatePrescriptionStatus);

module.exports = router;
