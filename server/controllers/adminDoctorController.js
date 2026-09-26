const Doctor = require('../models/Doctor');
const User = require('../models/User');

exports.createDoctor = async (req, res) => {
    try {
        const { 
            name, email, password, gender, specialization, qualifications, experience, 
            medicalRegistrationNumber, registrationAuthority, consultationFee, followUpFee,
            consultationType, consultationDuration, hospitalName, clinicAddress, 
            languagesSpoken, bio, status, imageUrl
        } = req.body;
        
        // 1. Create User
        const user = await User.create({
            name,
            email,
            passwordHash: password, // Pre-save hook hashes this
            phone: 'N/A', // Or from form
            role: 'DOCTOR'
        });

        // 2. Create Doctor
        const doctor = await Doctor.create({
            userId: user._id,
            specialization,
            qualifications: qualifications ? qualifications.split(',').map(q => q.trim()) : [],
            experienceYears: experience,
            medicalRegistrationNumber,
            registrationAuthority,
            consultationFee,
            followUpFee,
            consultationType,
            consultationDuration,
            hospitalName,
            clinicAddress,
            languagesSpoken: languagesSpoken ? languagesSpoken.split(',').map(l => l.trim()) : [],
            bio,
            imageUrl,
            status: status || 'Pending Verification',
            availability: []
        });

        res.status(201).json({ success: true, doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.json({ success: true, doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email');
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
        res.json({ success: true, doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateDoctor = async (req, res) => {
    try {
        const { 
            name, email, specialization, qualifications, experience, 
            medicalRegistrationNumber, registrationAuthority, consultationFee, followUpFee,
            consultationType, consultationDuration, hospitalName, clinicAddress, 
            languagesSpoken, bio, status, rejectionReason, imageUrl, availability
        } = req.body;
        
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

        if (name || email) {
            await User.findByIdAndUpdate(doctor.userId, { name, email });
        }

        const updateData = {
            specialization,
            experienceYears: experience,
            medicalRegistrationNumber,
            registrationAuthority,
            consultationFee,
            followUpFee,
            consultationType,
            consultationDuration,
            hospitalName,
            clinicAddress,
            bio,
            status,
            rejectionReason,
            imageUrl
        };

        if (qualifications) updateData.qualifications = Array.isArray(qualifications) ? qualifications : qualifications.split(',').map(q => q.trim());
        if (languagesSpoken) updateData.languagesSpoken = Array.isArray(languagesSpoken) ? languagesSpoken : languagesSpoken.split(',').map(l => l.trim());
        if (availability) updateData.availability = availability;

        const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('userId', 'name email');
        
        res.json({ success: true, doctor: updatedDoctor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyDoctor = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const doctor = await Doctor.findByIdAndUpdate(req.params.id, { status, rejectionReason }, { new: true }).populate('userId', 'name email');
        res.json({ success: true, doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (doctor) {
            await User.findByIdAndDelete(doctor.userId);
            await Doctor.findByIdAndDelete(req.params.id);
        }
        res.json({ success: true, message: 'Doctor deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
