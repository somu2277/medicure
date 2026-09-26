const fs = require('fs');
let code = fs.readFileSync('server/controllers/adminSettingsController.js', 'utf8');

const target = `const requestEmailChange = async (req, res) => {
    try {
        const { currentPassword, newEmail } = req.body;
        
        // 1. Basic validation`;

const replacement = `const requestEmailChange = async (req, res) => {
    const startTime = Date.now();
    const requestId = crypto.randomBytes(4).toString('hex');
    console.log(\`[Req \${requestId}] Starting email change OTP request\`);

    try {
        const { currentPassword, newEmail } = req.body;
        
        // 1. Basic validation`;

code = code.replace(target, replacement) || code.replace(target.replace(/\n/g, '\r\n'), replacement.replace(/\n/g, '\r\n'));

const target2 = `        // 4. Generate cryptographically secure OTP
        const otp = crypto.randomInt(100000, 999999).toString();`;

const replacement2 = `        console.log(\`[Req \${requestId}] Password verified in \${Date.now() - startTime}ms\`);
        
        // 4. Generate cryptographically secure OTP
        const otp = crypto.randomInt(100000, 999999).toString();`;

code = code.replace(target2, replacement2) || code.replace(target2.replace(/\n/g, '\r\n'), replacement2.replace(/\n/g, '\r\n'));

const target3 = `        try {
            await sendEmail({
                email: newEmail,
                subject: 'MediCare Admin - Email Verification OTP',
                message: \`Hello Admin, Your verification OTP is: \${otp}. It will expire in 5 minutes.\`,
            });
            
            res.status(200).json({ success: true, message: 'Verification OTP sent to new email' });
        } catch (emailError) {
            console.error('SMTP Error:', emailError.message);
            res.status(500).json({ success: false, message: 'Failed to send OTP email' });
        }`;

const replacement3 = `        try {
            const smtpStart = Date.now();
            await sendEmail({
                email: newEmail,
                subject: 'MediCare Admin - Email Verification OTP',
                message: \`Hello Admin, Your verification OTP is: \${otp}. It will expire in 5 minutes.\`,
            });
            console.log(\`[Req \${requestId}] SMTP Accepted email in \${Date.now() - smtpStart}ms\`);
            
            res.status(200).json({ success: true, message: 'Verification OTP sent to new email' });
            console.log(\`[Req \${requestId}] Total API Request completed in \${Date.now() - startTime}ms\`);
        } catch (emailError) {
            console.error(\`[Req \${requestId}] SMTP Error:\`, emailError.message);
            res.status(500).json({ success: false, message: 'Failed to send OTP email' });
        }`;

code = code.replace(target3, replacement3) || code.replace(target3.replace(/\n/g, '\r\n'), replacement3.replace(/\n/g, '\r\n'));

fs.writeFileSync('server/controllers/adminSettingsController.js', code);
