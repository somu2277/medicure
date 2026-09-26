const PlatformSettings = require('../models/PlatformSettings');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get Platform Settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
    try {
        let settings = await PlatformSettings.findOne();
        if (!settings) {
            settings = await PlatformSettings.create({});
        }
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Get Settings Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update Platform Settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        let settings = await PlatformSettings.findOne();
        if (!settings) {
            settings = new PlatformSettings(req.body);
        } else {
            Object.assign(settings, req.body);
        }
        await settings.save();
        res.json({ success: true, settings, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get Admin Profile
// @route   GET /api/admin/profile
// @access  Private/Admin
const getProfile = async (req, res) => {
    try {
        const admin = await User.findById(req.user._id).select('-passwordHash -otp -resetPasswordToken');
        res.json({ success: true, admin });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update Admin Profile
// @route   PUT /api/admin/profile
// @access  Private/Admin
const updateProfile = async (req, res) => {
    try {
        const { name, phone, username, avatar } = req.body;
        
        // Check for duplicate username if changed
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: req.user._id } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Username already taken' });
            }
        }

        const admin = await User.findById(req.user._id);
        if (name) admin.name = name;
        if (phone) admin.phone = phone;
        if (username) admin.username = username;
        if (avatar !== undefined) admin.avatar = avatar; // Allow empty string to remove avatar

        await admin.save();
        
        res.json({ success: true, admin: {
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            username: admin.username,
            avatar: admin.avatar,
            role: admin.role
        }, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Request Email Change (Sends OTP)
// @route   POST /api/admin/request-email-change
// @access  Private/Admin
const requestEmailChange = async (req, res) => {
    try {
        const { currentPassword, newEmail } = req.body;
        
        // 1. Basic validation
        if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        const admin = await User.findById(req.user._id);
        
        // 2. Verify current password
        const isMatch = await admin.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        // 3. Check that the new email is not already registered
        const existingEmail = await User.findOne({ email: newEmail });
        if (existingEmail) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // 4. Generate cryptographically secure OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        
        // 5. Store OTP as a hash
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        admin.pendingEmail = newEmail;
        admin.emailChangeOtp = otpHash;
        admin.emailChangeOtpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
        admin.emailChangeOtpAttempts = 0; // Reset attempts

        await admin.save();

        // 6. Send OTP via email using configured backend email service
        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #0f172a; margin-top: 0;">MediCare Admin - Email Verification OTP</h2>
                <p style="color: #334155; line-height: 1.6;">Hello Admin,</p>
                <p style="color: #334155; line-height: 1.6;">You requested to change the login email address associated with your MediCare administrator account.</p>
                <div style="background-color: #f8fafc; border-left: 4px solid #0d9488; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #475569; font-size: 14px; text-transform: uppercase; font-weight: bold;">Your Verification OTP is:</p>
                    <p style="margin: 10px 0 0 0; color: #0d9488; font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
                </div>
                <p style="color: #334155; line-height: 1.6;">This OTP will expire in <strong>5 minutes</strong>.</p>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    If you did not request this change, please ignore this email and secure your administrator account immediately.
                </p>
                <p style="color: #64748b; font-size: 14px;">Regards,<br><strong>MediCare Security Team</strong></p>
            </div>
        `;

        try {
            await sendEmail({
                email: newEmail,
                subject: 'MediCare Admin - Email Verification OTP',
                message: `Hello Admin, Your verification OTP is: ${otp}. It will expire in 5 minutes.`,
                html: emailBody
            });
            
            // 7. Return success response only after email service confirms submission
            res.json({ success: true, message: 'Verification OTP sent to your new email address. Please check your inbox and spam folder.' });
        } catch (emailError) {
            console.error('Email Delivery Error:', emailError);
            
            // Rollback OTP on email failure
            admin.pendingEmail = undefined;
            admin.emailChangeOtp = undefined;
            admin.emailChangeOtpExpire = undefined;
            admin.emailChangeOtpAttempts = 0;
            await admin.save();
            
            res.status(500).json({ 
                success: false, 
                message: 'Unable to send verification OTP. Please check the email configuration and try again.'
            });
        }
    } catch (error) {
        console.error('Request Email Change Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Verify Email Change
// @route   POST /api/admin/verify-email-change
// @access  Private/Admin
const verifyEmailChange = async (req, res) => {
    try {
        const { otp } = req.body;
        
        if (!otp || otp.trim() === '') {
            return res.status(400).json({ success: false, message: 'OTP is required' });
        }

        const admin = await User.findById(req.user._id);

        if (!admin.emailChangeOtp || !admin.emailChangeOtpExpire || !admin.pendingEmail) {
            return res.status(400).json({ success: false, message: 'No pending email change request found' });
        }

        // Limit verification attempts
        if (admin.emailChangeOtpAttempts >= 5) {
            admin.emailChangeOtp = undefined;
            admin.emailChangeOtpExpire = undefined;
            admin.pendingEmail = undefined;
            await admin.save();
            return res.status(400).json({ success: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' });
        }

        // Increment attempts
        admin.emailChangeOtpAttempts = (admin.emailChangeOtpAttempts || 0) + 1;

        if (admin.emailChangeOtpExpire < Date.now()) {
            admin.emailChangeOtp = undefined;
            admin.emailChangeOtpExpire = undefined;
            admin.pendingEmail = undefined;
            await admin.save();
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        // Hash the incoming OTP to compare
        const hashedInputOtp = crypto.createHash('sha256').update(otp).digest('hex');

        if (admin.emailChangeOtp !== hashedInputOtp) {
            await admin.save(); // save the incremented attempts
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Verification successful, update email
        const oldEmail = admin.email;
        admin.email = admin.pendingEmail;
        admin.pendingEmail = undefined;
        admin.emailChangeOtp = undefined;
        admin.emailChangeOtpExpire = undefined;
        admin.emailChangeOtpAttempts = 0;
        await admin.save();

        // Optional: Send notification to old email about the change
        try {
            await sendEmail({
                email: oldEmail,
                subject: 'MediCare Admin - Email Address Changed',
                message: `Hello Admin, the login email for your account has been successfully changed to ${admin.email}. If you did not authorize this change, please contact support immediately.`
            });
        } catch (e) {
            console.error('Failed to notify old email:', e);
        }

        res.json({ success: true, message: 'Login email updated successfully' });
    } catch (error) {
        console.error('Verify Email Change Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Change Password
// @route   PUT /api/admin/change-password
// @access  Private/Admin
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await User.findById(req.user._id);

        const isMatch = await admin.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect current password' });
        }

        // We set passwordHash, the pre-save hook handles hashing
        admin.passwordHash = newPassword;
        await admin.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    getProfile,
    updateProfile,
    requestEmailChange,
    verifyEmailChange,
    changePassword
};
