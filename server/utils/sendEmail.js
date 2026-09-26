const nodemailer = require('nodemailer');
const dns = require('dns').promises;

let transporter;

const getTransporter = async () => {
    if (!transporter) {
        // Manually resolve IPv4 to completely bypass Render's broken IPv6 routing
        const addresses = await dns.resolve4(process.env.SMTP_HOST);
        const ipv4Host = addresses[0];
        
        transporter = nodemailer.createTransport({
            host: ipv4Host,
            port: 465,
            secure: true,
            tls: {
                servername: process.env.SMTP_HOST // Prevent SSL Certificate Mismatch
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }
    return transporter;
};

const sendEmail = async (options) => {
    const activeTransporter = await getTransporter();

    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || undefined
    };

    const info = await activeTransporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
