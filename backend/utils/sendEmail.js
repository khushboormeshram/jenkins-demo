import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Email options
    const mailOptions = {
        from: `Code-E-Pariksha <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
    };

    // Send email
    await transporter.sendMail(mailOptions);
};
