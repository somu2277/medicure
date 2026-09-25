const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'], 
        default: 'PENDING' 
    },
    symptoms: { type: String },
    meetingLink: { type: String }, // For online consultations
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
