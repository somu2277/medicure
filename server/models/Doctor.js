const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialization: { type: String, required: true },
    qualifications: { type: [String], required: true },
    experienceYears: { type: Number, required: true },
    medicalRegistrationNumber: { type: String, required: true, unique: true },
    languagesSpoken: { type: [String], default: [] },
    isVerified: { type: Boolean, default: false },
    verificationDocuments: [{ type: String }],
    bio: { type: String },
    consultationFee: { type: Number, required: true },
    availability: [{
        dayOfWeek: { 
            type: String, 
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true }
    }],
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
