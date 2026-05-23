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

// Brevo SMTP login is often your Brevo account email (see SMTP & API tab), not always the sender address
const smtpUser = process.env.BREVO_SMTP_LOGIN || process.env.BREVO_SENDER_EMAIL;
const smtpPass = process.env.BREVO_SMTP_KEY;

if (!smtpUser || !smtpPass) {
    console.warn('[email] BREVO_SENDER_EMAIL and BREVO_SMTP_KEY must be set — verification emails will fail');
}

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
        user: smtpUser,
        pass: smtpPass,
    },
});

const sender = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: 'PlayPal',
};

/** Prefer Brevo HTTPS API — Render often blocks or times out SMTP port 587 */
async function deliverEmail(to, subject, html) {
    if (!sender.email) {
        throw new Error('BREVO_SENDER_EMAIL is not set');
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: { name: sender.name, email: sender.email },
                to: [{ email: to }],
                subject,
                htmlContent: html,
            }),
        });
        const body = await res.text();
        if (!res.ok) {
            throw new Error(`Brevo API ${res.status}: ${body}`);
        }
        const data = body ? JSON.parse(body) : {};
        console.log('[email] Brevo API ok →', to, data.messageId || '');
        return data;
    }

    if (!smtpPass) {
        throw new Error(
            'Email not configured: set BREVO_API_KEY on Render (recommended) or BREVO_SMTP_KEY for local SMTP'
        );
    }

    const info = await transporter.sendMail({
        from: `"${sender.name}" <${sender.email}>`,
        to,
        subject,
        html,
    });
    console.log('[email] SMTP ok →', to, info.messageId);
    return info;
}

const sendEmail = async (to, subject, html) => {
    try {
        await deliverEmail(to, subject, html);
    } catch (error) {
        console.error('Email send error:', error.message || error);
    }
};

const sendVerificationEmail = async (email, verificationToken) => {
    const html = VERIFICATION_EMAIL_TEMPLATE.replace('{verificationCode}', verificationToken);
    return deliverEmail(email, 'PlayPal — Your verification code', html);
};

const sendWelcomeEmail = async (email, name) => {
    const html = `<h2>Welcome, ${name}!</h2><p>Thanks for joining PlayPal. We're excited to have you on board.</p>`;
    return deliverEmail(email, 'Welcome to PLAYPAL!', html);
};

const sendPasswordResetEmail = async (email, resetToken) => {
    const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetToken);
    return deliverEmail(email, 'Password Reset', html);
};

const sendPasswordResetSuccessEmail = async (email) => {
    return deliverEmail(email, 'Password Reset Successful', PASSWORD_RESET_SUCCESS_TEMPLATE);
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

        return await deliverEmail(futsalOwner.email, 'Your Futsal Registration is Approved!', html);
    } catch (error) {
        console.error('Error sending approval email:', error);
        throw new Error('Email not sent: ' + error.message);
    }
};

const sendFutsalOwnerRejectionEmail = async (futsalOwner) => {
    try {
        const html = FUTSAL_OWNER_REJECTION_TEMPLATE
            .replace('{ownerName}', futsalOwner.fullName)
            .replace('{futsalName}', futsalOwner.futsalName)
            .replace('{contactURL}', `${process.env.FRONTEND_URL}/contact`);

        return await deliverEmail(futsalOwner.email, 'Futsal Registration Status Update', html);
    } catch (error) {
        console.error('Error sending rejection email:', error);
        throw new Error('Email not sent: ' + error.message);
    }
};

const sendFutsalOwnerPendingEmail = async (futsalOwner) => {
    try {
        const html = FUTSAL_OWNER_PENDING_TEMPLATE
            .replace('{ownerName}', futsalOwner.fullName)
            .replace('{futsalName}', futsalOwner.futsalName)
            .replace('{futsalLocation}', futsalOwner.futsalLocation)
            .replace('{submittedDate}', new Date(futsalOwner.createdAt).toLocaleString());

        return await deliverEmail(futsalOwner.email, 'Your Futsal Registration is Under Review', html);
    } catch (error) {
        console.error('Error sending pending email:', error);
        throw new Error('Email not sent: ' + error.message);
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

        return await deliverEmail(
            process.env.ADMIN_EMAIL || sender.email,
            'New Futsal Registration Pending Approval',
            html
        );
    } catch (error) {
        console.error('Error sending admin notification:', error);
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