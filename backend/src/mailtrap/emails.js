const nodemailer = require('nodemailer');
require('dotenv').config();
const { 
  VERIFICATION_EMAIL_TEMPLATE, 
  PASSWORD_RESET_REQUEST_TEMPLATE, 
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  FUTSAL_OWNER_APPROVAL_TEMPLATE,
  FUTSAL_OWNER_REJECTION_TEMPLATE,
  FUTSAL_OWNER_PENDING_TEMPLATE,
  ADMIN_NEW_REGISTRATION_NOTIFICATION
} = require('./emailTemplates');

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_SENDER_EMAIL,
        pass: process.env.BREVO_SMTP_KEY,
    },
});

const sender = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: 'PlayPal',
};

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
        // throw new Error("Email not sent: " + error.message);
        console.error("Email not sent:", error.message);
        return;

    }
};

const sendWelcomeEmail = async (email, name) => {
    const html = `<h2>Welcome, ${name}!</h2><p>Thanks for joining PlayPal. We're excited to have you on board.</p>`;

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
        throw new Error("Email not sent: " + error.message);
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

// ✅ NEW: Futsal Owner Email Functions
const sendFutsalOwnerApprovalEmail = async (futsalOwner) => {
    try {
        const html = FUTSAL_OWNER_APPROVAL_TEMPLATE
            .replace('{ownerName}', futsalOwner.fullName)
            .replace('{futsalName}', futsalOwner.futsalName)
            .replace('{futsalLocation}', futsalOwner.futsalLocation)
            .replace('{registrationDate}', new Date(futsalOwner.createdAt).toLocaleDateString())
            .replace('{loginURL}', `${process.env.FRONTEND_URL}/login`);

        const info = await transporter.sendMail({
            from: `"${sender.name}" <${sender.email}>`,
            to: futsalOwner.email,
            subject: "Your Futsal Registration is Approved!",
            html,
        });

        console.log("Approval email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending approval email:", error);
        throw new Error("Email not sent: " + error.message);
    }
};

const sendFutsalOwnerRejectionEmail = async (futsalOwner) => {
    try {
        const html = FUTSAL_OWNER_REJECTION_TEMPLATE
            .replace('{ownerName}', futsalOwner.fullName)
            .replace('{futsalName}', futsalOwner.futsalName)
            .replace('{contactURL}', `${process.env.FRONTEND_URL}/contact`);

        const info = await transporter.sendMail({
            from: `"${sender.name}" <${sender.email}>`,
            to: futsalOwner.email,
            subject: "Futsal Registration Status Update",
            html,
        });

        console.log("Rejection email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending rejection email:", error);
        throw new Error("Email not sent: " + error.message);
    }
};

const sendFutsalOwnerPendingEmail = async (futsalOwner) => {
    try {
        const html = FUTSAL_OWNER_PENDING_TEMPLATE
            .replace('{ownerName}', futsalOwner.fullName)
            .replace('{futsalName}', futsalOwner.futsalName)
            .replace('{futsalLocation}', futsalOwner.futsalLocation)
            .replace('{submittedDate}', new Date(futsalOwner.createdAt).toLocaleString());

        const info = await transporter.sendMail({
            from: `"${sender.name}" <${sender.email}>`,
            to: futsalOwner.email,
            subject: " Your Futsal Registration is Under Review",
            html,
        });

        console.log("Pending confirmation email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error(" Error sending pending email:", error);
        throw new Error("Email not sent: " + error.message);
    }
};

const sendAdminNewRegistrationNotification = async (futsalOwner) => {
    try {
        const html = ADMIN_NEW_REGISTRATION_NOTIFICATION
            .replace('{ownerName}', futsalOwner.fullName)
            .replace('{ownerEmail}', futsalOwner.email)
            .replace('{ownerPhone}', futsalOwner.phone)
            .replace('{futsalName}', futsalOwner.futsalName)
            .replace('{futsalLocation}', futsalOwner.futsalLocation)
            .replace('{businessContact}', futsalOwner.businessContact)
            .replace('{submittedDate}', new Date(futsalOwner.createdAt).toLocaleString())
            .replace('{reviewURL}', `${process.env.FRONTEND_URL}/admin/futsal-approvals`);

        const info = await transporter.sendMail({
            from: `"${sender.name}" <${sender.email}>`,
            to: process.env.ADMIN_EMAIL || sender.email,
            subject: " New Futsal Registration Pending Approval",
            html,
        });

        console.log(" Admin notification sent:", info.messageId);
        return info;
    } catch (error) {
        console.error(" Error sending admin notification:", error);
        // Don't throw - admin notification failure shouldn't break registration
    }
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendPasswordResetSuccessEmail,
    // ✅ NEW: Futsal Owner Functions
    sendFutsalOwnerApprovalEmail,
    sendFutsalOwnerRejectionEmail,
    sendFutsalOwnerPendingEmail,
    sendAdminNewRegistrationNotification,
    sender
};