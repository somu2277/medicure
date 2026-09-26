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

const replacement1 = `        // Dispatch email asynchronously so UI does not freeze
        sendEmail({
            email: user.email,
            subject: 'Your MediCare Login Code',
            message
        }).catch(emailError => {
            console.error('Background SMTP Error:', emailError.message);
            console.log(\`\\n======================================\\ndYs? DEVELOPMENT MODE: OTP for \${email} is: \${otp}\\n======================================\\n\`);
        });
        
        res.status(200).json({ success: true, message: 'OTP dispatched successfully' });`;

if(code.includes(target1)) {
    code = code.replace(target1, replacement1);
    fs.writeFileSync('server/controllers/authController.js', code);
} else {
    // try with \r\n
    code = code.replace(target1.replace(/\n/g, '\r\n'), replacement1.replace(/\n/g, '\r\n'));
    fs.writeFileSync('server/controllers/authController.js', code);
}
