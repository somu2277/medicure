const fs = require('fs');
let code = fs.readFileSync('server/controllers/authController.js', 'utf8');

const regex = /catch \(emailError\) \{[\s\S]*?res\.status\(200\)\.json\(\{ success: true, message: 'OTP sent \(Check terminal output\)' \}\);\r?\n\s*\}/g;

code = code.replace(regex, `catch (emailError) {
            console.error('SMTP Error:', emailError.message);
            res.status(500).json({ success: false, message: 'Failed to send OTP via email. Please check SMTP configuration.' });
        }`);

fs.writeFileSync('server/controllers/authController.js', code);
