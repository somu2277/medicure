const Doctor = require('../models/Doctor');

exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().populate('userId', 'name email');
        res.json({ success: true, data: doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email');
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
        res.json({ success: true, data: doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyDoctor = async (req, res) => {
    try {
        const { isVerified } = req.body;
        const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isVerified }, { new: true });
        res.json({ success: true, data: doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        await Doctor.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Doctor deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
