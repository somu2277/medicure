const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', appointmentController.createAppointment);
router.get('/', protect, appointmentController.getPatientAppointments);
router.get('/patient/:patientId', appointmentController.getPatientAppointments);
router.get('/doctor/:doctorId', appointmentController.getDoctorAppointments);
router.put('/:id/status', appointmentController.updateAppointmentStatus);

module.exports = router;
