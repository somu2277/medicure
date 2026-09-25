const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
// const { protect, authorize } = require('../middleware/auth');

router.post('/', appointmentController.createAppointment);
router.get('/patient/:patientId', appointmentController.getPatientAppointments);
router.get('/doctor/:doctorId', appointmentController.getDoctorAppointments);
router.put('/:id/status', appointmentController.updateAppointmentStatus);

module.exports = router;
