const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

exports.createAppointment = async (req, res) => {
    try {
        const { 
            doctorId, patientName, patientEmail, patientContact, 
            preferredDate, preferredTimeOfDay, alternativeDate, symptoms, consultationType, 
            feeSnapshot, paymentStatus, paymentReference, status 
        } = req.body;
        
        const patientId = req.user ? req.user._id : req.body.patientId;

        const newAppointment = new Appointment({
            patientId,
            doctorId,
            patientName,
            patientEmail,
            patientContact,
            preferredDate,
            preferredTimeOfDay,
            alternativeDate,
            symptoms,
            consultationType,
            feeSnapshot,
            paymentStatus,
            paymentReference,
            status
        });

        const savedAppointment = await newAppointment.save();

        // Socket logic
        const io = req.app.get('io');
        if (io) {
            io.emit('appointment:created', savedAppointment);
        }

        // Email logic
        try {
            await sendEmail({
                email: patientEmail,
                subject: 'Appointment Request Submitted - MediCare',
                message: `Dear ${patientName},\n\nYour appointment request has been received. Our team is checking the doctor's availability and will contact you to confirm the appointment date and time.\n\nPreferred Date: ${preferredDate ? new Date(preferredDate).toDateString() : 'Any Available Date'}\nPreferred Time: ${preferredTimeOfDay || 'Any Time'}\nType: ${consultationType}\nFee: ₹${feeSnapshot}\nStatus: ${status}\n\nThank you for choosing MediCare.`
            });
        } catch (e) { console.error("Email send failed:", e); }

        res.status(201).json({ success: true, appointment: savedAppointment });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error creating appointment', error: error.message });
    }
};

exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } })
            .populate('patientId', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching appointments', error: error.message });
    }
};

exports.getPatientAppointments = async (req, res) => {
    try {
        const patientId = req.user ? req.user._id : req.params.patientId;
        const appointments = await Appointment.find({ patientId })
            .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name imageUrl' } })
            .sort({ date: -1 });
        res.status(200).json({ success: true, appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching appointments', error: error.message });
    }
};

exports.getDoctorAppointments = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const appointments = await Appointment.find({ doctorId })
            .populate('patientId', 'name email phone')
            .sort({ date: 1 });
        res.status(200).json({ success: true, appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching appointments', error: error.message });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status, rejectionReason, paymentStatus, confirmedDate, confirmedStartTime, duration, schedulingNotes } = req.body;
        
        let appointment = await Appointment.findById(req.params.id).populate({ path: 'doctorId', populate: { path: 'userId' } });
        if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

        const updateData = { status };
        if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;
        if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
        if (confirmedDate !== undefined) updateData.confirmedDate = confirmedDate;
        if (confirmedStartTime !== undefined) updateData.confirmedStartTime = confirmedStartTime;
        if (duration !== undefined) updateData.duration = duration;
        if (schedulingNotes !== undefined) updateData.schedulingNotes = schedulingNotes;

        // Check overlapping if we are confirming a time
        if (confirmedDate && confirmedStartTime) {
            const overlapping = await Appointment.findOne({
                doctorId: appointment.doctorId._id,
                _id: { $ne: appointment._id },
                status: 'Approved / Confirmed',
                confirmedDate: new Date(confirmedDate),
                confirmedStartTime: confirmedStartTime
            });

            if (overlapping) {
                return res.status(400).json({ success: false, message: 'The doctor already has a confirmed appointment at this time.' });
            }
        }

        // Provision video room if Approved / Confirmed and Video
        if (status === 'Approved / Confirmed' && appointment.consultationType === 'Video' && !appointment.meetingLink) {
            updateData.meetingLink = 'meet.medicure.com/' + crypto.randomBytes(8).toString('hex');
        }

        const updated = await Appointment.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } });

        // Socket
        const io = req.app.get('io');
        if (io) {
            io.emit('appointment:statusChanged', updated);
        }

        // Email Notification
        try {
            if (status === 'Approved / Confirmed') {
                await sendEmail({
                    email: updated.patientEmail,
                    subject: 'Appointment Scheduled - MediCare',
                    message: `Hello ${updated.patientName},\n\nYour MediCare doctor consultation has been scheduled.\n\nDoctor: Dr. ${updated.doctorId.userId.name}\nSpecialization: ${updated.doctorId.specialization}\nAppointment Date: ${new Date(updated.confirmedDate).toDateString()}\nAppointment Time: ${updated.confirmedStartTime}\nConsultation Type: ${updated.consultationType}\nAppointment ID: ${updated._id}\n${updated.meetingLink ? '\nVideo Link: https://' + updated.meetingLink : ''}\n\nPlease log in to your MediCare account to view your appointment details.\n\nThank you,\nMediCare Team`
                });
            } else if (status === 'Rejected') {
                await sendEmail({
                    email: updated.patientEmail,
                    subject: 'Appointment Rejected - MediCare',
                    message: `Your appointment request with Dr. ${updated.doctorId.userId.name} was rejected.\nReason: ${rejectionReason}\nRefund will be initiated if applicable.`
                });
            }
        } catch (e) { console.error("Email send failed:", e); }

        res.status(200).json({ success: true, appointment: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error updating appointment', error: error.message });
    }
};
