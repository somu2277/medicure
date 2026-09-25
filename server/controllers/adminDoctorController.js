const Doctor = require('../models/Doctor');
const User = require('../models/User');

exports.createDoctor = async (req, res) => {
    try {
        const { name, email, password, specialization, experience, medicalRegistrationNumber, consultationFee, status } = req.body;
        
        // 1. Create the user for the doctor
        const user = await User.create({
            name,
            email,
            passwordHash: password, // The pre-save hook will hash it
            phone: 'N/A', // Default or make it optional
            role: 'DOCTOR'
        });

        // 2. Create the Doctor profile
        const doctor = await Doctor.create({
            userId: user._id,
            specialization,
            qualifications: ['MBBS'], // default
            experienceYears: experience,
            medicalRegistrationNumber,
            consultationFee,
            isVerified: status === 'Verified'
        });

        res.status(201).json({ success: true, data: doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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

exports.updateDoctor = async (req, res) => {
    try {
        const { specialization, experience, medicalRegistrationNumber, consultationFee, status } = req.body;
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id, 
            { 
                specialization, 
                experienceYears: experience, 
                medicalRegistrationNumber, 
                consultationFee, 
                isVerified: status === 'Verified' 
            }, 
            { new: true }
        );
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
