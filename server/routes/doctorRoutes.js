const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
// const { protect, authorize } = require('../middleware/auth'); // If auth is implemented

router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);
router.post('/', doctorController.createDoctor);
router.put('/:id', doctorController.updateDoctor);

module.exports = router;
