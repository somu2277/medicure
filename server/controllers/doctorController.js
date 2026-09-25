const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const crypto = require('crypto');

// Get Doctor Dashboard
exports.getDashboard = async (req, res) => {
    try {
        const doctorId = req.params.id; // Or from req.user
        const doctor = await Doctor.findById(doctorId).populate('userId', 'name email');
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
        
        const appointmentsCount = await Appointment.countDocuments({ doctorId });
        
        res.json({ success: true, data: { doctor, appointmentsCount } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Availability
exports.updateAvailability = async (req, res) => {
    try {
        const { availability } = req.body;
        const doctorId = req.params.id;
        
        const doctor = await Doctor.findByIdAndUpdate(doctorId, { availability }, { new: true });
        res.json({ success: true, data: doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Appointments
exports.getAppointments = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const appointments = await Appointment.find({ doctorId }).populate('patientId', 'name email').sort({ date: 1 });
        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Generate Room ID
exports.generateRoomId = async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const appointment = await Appointment.findById(appointmentId);
        
        if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
        
        // Generate secure random room ID
        const roomId = crypto.randomBytes(16).toString('hex');
        
        // Update appointment with meeting link / room ID
        appointment.meetingLink = roomId;
        await appointment.save();
        
        res.json({ success: true, roomId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
