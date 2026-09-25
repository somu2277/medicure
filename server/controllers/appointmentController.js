const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

exports.createAppointment = async (req, res) => {
    try {
        const { doctorId, date, startTime, endTime, symptoms } = req.body;
        
        // Ensure patientId comes from auth token if applicable, or body for now
        const patientId = req.user ? req.user._id : req.body.patientId;

        const newAppointment = new Appointment({
            patientId,
            doctorId,
            date,
            startTime,
            endTime,
            symptoms
        });

        const savedAppointment = await newAppointment.save();
        res.status(201).json(savedAppointment);
    } catch (error) {
        res.status(400).json({ message: 'Error creating appointment', error: error.message });
    }
};

exports.getPatientAppointments = async (req, res) => {
    try {
        const patientId = req.user ? req.user._id : req.params.patientId;
        const appointments = await Appointment.find({ patientId })
            .populate({
                path: 'doctorId',
                populate: { path: 'userId', select: 'name' }
            })
            .sort({ date: -1 });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
};

exports.getDoctorAppointments = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const appointments = await Appointment.find({ doctorId })
            .populate('patientId', 'name email phone')
            .sort({ date: 1 });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Error updating appointment', error: error.message });
    }
};
