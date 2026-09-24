const fs = require('fs');
const code = `
// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    const sendEmail = require('../utils/sendEmail');
    const crypto = require('crypto');

    try {
        let user = await User.findOne({ email });

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        if (!user) {
            // Optional: Auto-create user if they don't exist
            user = await User.create({
                name: email.split('@')[0],
                email,
                phone: '0000000000',
                passwordHash: crypto.randomBytes(20).toString('hex'), // Dummy password
                role: 'CUSTOMER'
            });
        }

        user.otp = crypto.createHash('sha256').update(otp).digest('hex');
        user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save({ validateBeforeSave: false });

        const message = \`Your MediCare verification code is: \${otp}\\n\\nThis code is valid for 10 minutes.\`;

        await sendEmail({
            email: user.email,
            subject: 'Your MediCare Login Code',
            message
        });

        res.status(200).json({ success: true, message: 'OTP sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Could not send OTP email' });
    }
};

// @desc    Verify OTP and login
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const crypto = require('crypto');

    try {
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.findOne({
            email,
            otp: hashedOtp,
            otpExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Clear OTP
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save({ validateBeforeSave: false });

        // Login user
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
`;
fs.appendFileSync('server/controllers/authController.js', code);
