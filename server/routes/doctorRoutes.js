const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

router.get('/', doctorController.getAllDoctors);

router.get('/:id/dashboard', doctorController.getDashboard);
router.put('/:id/availability', doctorController.updateAvailability);
router.get('/:id/appointments', doctorController.getAppointments);
router.post('/appointments/:appointmentId/generate-room', doctorController.generateRoomId);

router.get('/:id', doctorController.getDoctorById);

module.exports = router;
