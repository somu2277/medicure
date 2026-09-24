const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
    type: { type: String, enum: ['HOME', 'WORK', 'OTHER'], default: 'HOME' },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { 
        type: String, 
        enum: [
            'SUPER_ADMIN', 
            'PHARMACIST', 
            'INVENTORY_MANAGER', 
            'LAB_MANAGER', 
            'ORDER_MANAGER', 
            'SUPPORT_AGENT', 
            'DOCTOR', 
            'CUSTOMER'
        ], 
        default: 'CUSTOMER' 
    },
    addresses: [addressSchema],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    otp: String,
    otpExpire: Date
}, { timestamps: true });

userSchema.pre('save', async function() {
    if (!this.isModified('passwordHash')) return;
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
    const crypto = require('crypto');
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);