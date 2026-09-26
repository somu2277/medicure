const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, appointmentController.createAppointment);
router.get('/', protect, authorizeRoles('SUPER_ADMIN', 'DOCTOR'), appointmentController.getAllAppointments);
router.get('/my-appointments', protect, appointmentController.getPatientAppointments);
router.get('/patient/:patientId', protect, appointmentController.getPatientAppointments);
router.get('/doctor/:doctorId', protect, appointmentController.getDoctorAppointments);
router.put('/:id/status', protect, authorizeRoles('SUPER_ADMIN', 'DOCTOR'), appointmentController.updateAppointmentStatus);

module.exports = router;
