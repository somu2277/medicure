const fs = require('fs');
let code = fs.readFileSync('server/controllers/authController.js', 'utf8');

const target1 = `        try {
            await sendEmail({
                email: user.email,
                subject: 'Your MediCare Login Code',
                message
            });
            res.status(200).json({ success: true, message: 'OTP sent to email' });
        } catch (emailError) {
            console.error('SMTP Error:', emailError.message);
            // Fallback for development if SMTP fails
            console.log(\`\\n======================================\\ndYs? DEVELOPMENT MODE: OTP for \${email} is: \${otp}\\n======================================\\n\`);
            res.status(200).json({ success: true, message: 'OTP sent (Check terminal output)' });
        }`;

const replacement1 = `        try {
            await sendEmail({
                email: user.email,
                subject: 'Your MediCare Login Code',
                message
            });
            res.status(200).json({ success: true, message: 'OTP sent to email' });
        } catch (emailError) {
            console.error('SMTP Error:', emailError.message);
            res.status(500).json({ success: false, message: 'Failed to send OTP via email. Please check SMTP configuration.' });
        }`;

if(code.includes(target1)) {
    code = code.replace(target1, replacement1);
} else if(code.includes(target1.replace(/\n/g, '\r\n'))) {
    code = code.replace(target1.replace(/\n/g, '\r\n'), replacement1.replace(/\n/g, '\r\n'));
} else {
    console.log('Target1 not found');
}

fs.writeFileSync('server/controllers/authController.js', code);
