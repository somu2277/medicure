const mongoose = require('mongoose');

const videoSessionSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'WAITING' },
    startedAt: { type: Date },
    endedAt: { type: Date },
    recordingUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('VideoSession', videoSessionSchema);
