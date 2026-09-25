const mongoose = require('mongoose');

const consultationRecordSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, required: true },
    diagnosis: { type: String },
    followUpDate: { type: Date },
    attachments: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('ConsultationRecord', consultationRecordSchema);
