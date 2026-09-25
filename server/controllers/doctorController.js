const Doctor = require('../models/Doctor');
const User = require('../models/User');

exports.getDoctors = async (req, res) => {
    try {
        const filters = {};
        if (req.query.specialization) {
            filters.specialization = req.query.specialization;
        }
        if (req.query.isActive !== undefined) {
            filters.isActive = req.query.isActive === 'true';
        }
        
        const doctors = await Doctor.find(filters).populate('userId', 'name email phone');
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctors', error: error.message });
    }
};

exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email phone');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctor', error: error.message });
    }
};

exports.createDoctor = async (req, res) => {
    try {
        const newDoctor = new Doctor(req.body);
        const savedDoctor = await newDoctor.save();
        res.status(201).json(savedDoctor);
    } catch (error) {
        res.status(400).json({ message: 'Error creating doctor', error: error.message });
    }
};

exports.updateDoctor = async (req, res) => {
    try {
        const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedDoctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.status(200).json(updatedDoctor);
    } catch (error) {
        res.status(400).json({ message: 'Error updating doctor', error: error.message });
    }
};
