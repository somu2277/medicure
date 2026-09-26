const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientName: { type: String, required: true },
    patientContact: { type: String, required: true },
    patientEmail: { type: String, required: true },
    preferredDate: { type: Date },
    preferredTimeOfDay: { type: String, enum: ['Morning', 'Afternoon', 'Evening', 'Any Time'], default: 'Any Time' },
    alternativeDate: { type: Date },
    confirmedDate: { type: Date },
    confirmedStartTime: { type: String },
    duration: { type: Number },
    schedulingNotes: { type: String },
    consultationType: {
        type: String,
        enum: ['Video', 'In-person'],
        required: true
    },
    feeSnapshot: { type: Number, required: true },
    status: { 
        type: String, 
        enum: [
            'Request Submitted',
            'Awaiting Payment',
            'Paid - Awaiting Admin Review',
            'Awaiting Doctor Availability',
            'Proposed Schedule',
            'Scheduled - Awaiting Customer Confirmation',
            'Approved / Confirmed',
            'Rejected',
            'Cancelled',
            'Rescheduled',
            'Completed',
            'No-show'
        ], 
        default: 'Awaiting Payment' 
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
        default: 'Pending'
    },
    paymentReference: { type: String }, // Gateway order/tx ID
    rejectionReason: { type: String },
    symptoms: { type: String },
    meetingLink: { type: String }, // For online consultations
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
