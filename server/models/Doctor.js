const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialization: { type: String, required: true },
    qualifications: { type: [String], required: true },
    experienceYears: { type: Number, required: true },
    medicalRegistrationNumber: { type: String, required: true, unique: true },
    registrationAuthority: { type: String },
    languagesSpoken: { type: [String], default: [] },
    status: {
        type: String,
        enum: ['Pending Verification', 'Verified', 'Rejected', 'Inactive', 'Suspended'],
        default: 'Pending Verification'
    },
    rejectionReason: { type: String },
    verificationDocuments: [{ type: String }],
    bio: { type: String },
    hospitalName: { type: String },
    clinicAddress: { type: String },
    consultationFee: { type: Number, required: true },
    followUpFee: { type: Number },
    consultationType: {
        type: String,
        enum: ['Video', 'In-person', 'Both'],
        default: 'Video'
    },
    consultationDuration: { type: Number, default: 30 }, // in minutes
    availability: [{
        dayOfWeek: { 
            type: String, 
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        maxAppointments: { type: Number, default: 1 }
    }],
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
