const nodemailer = require('nodemailer');
require('dotenv').config();
const { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE} = require ('./emailTemplates');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { 
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

const sender = {
    email : process.env.EMAIL_USER,
    name : "PlayPal",
}


const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"${sender.name}" <${sender.email}>`,
            to,
            subject,
            html,
        });
        console.log("Email sent to:", to);
    } catch (error) {
        console.error("Email send error:", error);
    }
};

const sendVerificationEmail = async (email, verificationToken) => {
    try {
        const info = await transporter.sendMail({
            from: `"${sender.name}" <${sender.email}>`,

            to: email,
            subject: "Account Verification",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
        });

        console.log("Verification email sent:", info.messageId);
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Email not sent: " + error.message);
    }
};

const sendWelcomeEmail = async (email, name) => {
    const html = `<h2>Welcome, ${name}!</h2><p>Thanks for joining PlayPal. We’re excited to have you on board.</p>`;

    try {
        const info = await transporter.sendMail({
            from: `"${sender.name}" <${sender.email}>`,
            to: email,
            subject: "Welcome to PLAYPAL!",
            html,
        });

        console.log("Welcome email sent:", info.messageId);
    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw new Error("Email not sent: " + error.message);            //E-mail
    }
};

const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const info = await transporter.sendMail({
            from: `"${sender.name}" <${sender.email}>`,
            to: email,
            subject: "Password Reset",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetToken),
        });

        console.log("Password reset email sent:", info.messageId);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Email not sent: " + error.message);
    }
};

const sendPasswordResetSuccessEmail = async (email) => {
    try {
        const info = await transporter.sendMail({
            from: `"${sender.name}" <${sender.email}>`,
            to: email,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        });

        console.log("Password reset success email sent:", info.messageId);
    } catch (error) {
        console.error("Error sending password reset success email:", error);
        throw new Error("Email not sent: " + error.message);
    }
};



module.exports = {sendEmail,sendVerificationEmail,sendWelcomeEmail,sendPasswordResetEmail, sendPasswordResetSuccessEmail, sender};