const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
    platformName: { type: String, default: 'MediCare' },
    supportEmail: { type: String, default: 'support@medicare.com' },
    customerCarePhone: { type: String, default: '+91 1800-419-1111' },
    freeDeliveryThreshold: { type: Number, default: 499 },
    standardDeliveryFee: { type: Number, default: 49 },
    twoFactorEnabled: { type: Boolean, default: false },
    notifications: {
        newOrder: { type: Boolean, default: true },
        prescriptionUpload: { type: Boolean, default: true },
        labTestBooking: { type: Boolean, default: true },
        doctorAppointment: { type: Boolean, default: true },
        paymentConfirmation: { type: Boolean, default: true },
        securityAlerts: { type: Boolean, default: true },
    }
}, { timestamps: true });

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
