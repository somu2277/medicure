const fs = require('fs');
let code = fs.readFileSync('server/controllers/authController.js', 'utf8');

const target = `        // Dispatch email asynchronously so UI does not freeze
        sendEmail({
            email: user.email,
            subject: 'Your MediCare Login Code',
            message
        }).catch(emailError => {
            console.error('Background SMTP Error:', emailError.message);
            console.log(\`\\n======================================\\ndYs? DEVELOPMENT MODE: OTP for \${email} is: \${otp}\\n======================================\\n\`);
        });
        
        res.status(200).json({ success: true, message: 'OTP dispatched successfully' });`;

const replacement = `        try {
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
            return res.status(500).json({ success: false, message: 'Failed to send OTP email. Please try again.' });
        }`;

if(code.includes(target)) {
    code = code.replace(target, replacement);
} else if(code.includes(target.replace(/\n/g, '\r\n'))) {
    code = code.replace(target.replace(/\n/g, '\r\n'), replacement.replace(/\n/g, '\r\n'));
} else {
    console.log('Target not found');
}
fs.writeFileSync('server/controllers/authController.js', code);
