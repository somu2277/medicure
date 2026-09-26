const nodemailer = require('nodemailer');

// Create reusable transporter object using connection pooling
// This prevents the overhead of creating a new SMTP connection on every single email
let transporter;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            pool: true, // Use pooled connections for faster subsequent emails
            maxConnections: 1, // Gmail limits concurrent connections for personal accounts
            connectionTimeout: 10000, // 10 seconds timeout for initial connection
            greetingTimeout: 10000, // 10 seconds timeout for greeting
            socketTimeout: 15000, // 15 seconds timeout for socket inactivity
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }
    return transporter;
};

const sendEmail = async (options) => {
    const activeTransporter = getTransporter();

    // send mail with defined transport object
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
