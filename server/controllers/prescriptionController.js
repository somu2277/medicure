const Prescription = require('../models/Prescription');

// @desc    Upload a prescription
// @route   POST /api/prescriptions
// @access  Private
const uploadPrescription = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const prescription = new Prescription({
            userId: req.user._id,
            fileUrl: `/uploads/${req.file.filename}`,
            fileType: req.file.mimetype,
            status: 'PENDING'
        });

        const createdPrescription = await prescription.save();

        // Emit socket event to admin room
        const io = req.app.get('io');
        if (io) {
            io.to('admin_room').emit('new_prescription', createdPrescription);
        }

        res.status(201).json({ success: true, prescription: createdPrescription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all prescriptions (Admin) or user's prescriptions
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'CUSTOMER') {
            filter.userId = req.user._id;
        }

        const prescriptions = await Prescription.find(filter)
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

        res.json({ success: true, prescriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update prescription status
// @route   PATCH /api/prescriptions/:id/status
// @access  Private/Admin
const updatePrescriptionStatus = async (req, res) => {
    try {
        const { status, reviewNotes } = req.body;
        const prescription = await Prescription.findById(req.params.id);

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        prescription.status = status;
        prescription.reviewerId = req.user._id;
        prescription.reviewNotes = reviewNotes || prescription.reviewNotes;
        prescription.reviewedAt = Date.now();

        const updated = await prescription.save();

        // Notify user
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${prescription.userId}`).emit('prescription_updated', updated);
        }

        res.json({ success: true, prescription: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    uploadPrescription,
    getPrescriptions,
    updatePrescriptionStatus
};
