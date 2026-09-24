const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String },
    status: { 
        type: String, 
        enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNotes: { type: String },
    reviewedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);