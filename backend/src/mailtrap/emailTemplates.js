const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>Your PlayPal Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>Your PlayPal Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>Your PLAYPAL Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

// ✅ NEW: Futsal Owner Approval Templates
const FUTSAL_OWNER_APPROVAL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Futsal Registration Approved</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #10B981, #059669); padding: 30px 20px; text-align: center;">
    <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
    <h1 style="color: white; margin: 0; font-size: 28px;">Congratulations!</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Futsal Registration is Approved</p>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 40px 30px;">
    <h2 style="color: #10B981; margin-top: 0;">Hello {ownerName},</h2>
    
    <p>Great news! We're excited to inform you that your futsal business has been approved and is now active on our platform.</p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
      <p style="margin: 5px 0;"><strong>Futsal Name:</strong> {futsalName}</p>
      <p style="margin: 5px 0;"><strong>Location:</strong> {futsalLocation}</p>
      <p style="margin: 5px 0;"><strong>Registration Date:</strong> {registrationDate}</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #10B981; font-weight: bold;">✓ APPROVED</span></p>
    </div>
    
    <h3 style="color: #374151;">What's Next?</h3>
    <ul style="padding-left: 20px;">
      <li style="margin: 10px 0; color: #4b5563;"><strong>Log in to your dashboard</strong> - Access your owner portal</li>
      <li style="margin: 10px 0; color: #4b5563;"><strong>Complete your profile</strong> - Add more details about your facility</li>
      <li style="margin: 10px 0; color: #4b5563;"><strong>Set up courts and pricing</strong> - Configure your booking system</li>
      <li style="margin: 10px 0; color: #4b5563;"><strong>Upload more images</strong> - Showcase your futsal ground</li>
      <li style="margin: 10px 0; color: #4b5563;"><strong>Start accepting bookings</strong> - Begin your journey with PlayPal!</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{loginURL}" style="display: inline-block; background-color: #10B981; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">Login to Dashboard →</a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      <strong>Need Help?</strong><br>
      If you have any questions or need assistance getting started, our support team is here to help.
      Contact us at <a href="mailto:support@playpal.com" style="color: #10B981;">support@playpal.com</a>
    </p>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>The PlayPal Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p>© 2024 PlayPal. All rights reserved.</p>
    <p>You're receiving this email because you registered on PlayPal.</p>
  </div>
</body>
</html>
`;

const FUTSAL_OWNER_REJECTION_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #EF4444, #DC2626); padding: 30px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Registration Status Update</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 40px 30px;">
    <h2 style="color: #374151; margin-top: 0;">Hello {ownerName},</h2>
    
    <p>Thank you for your interest in joining PlayPal and for taking the time to submit your registration.</p>
    
    <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
      <p style="margin: 0;">After careful review of your application for <strong>{futsalName}</strong>, we regret to inform you that we are unable to approve your registration at this time.</p>
    </div>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #374151; margin-top: 0;">Common Reasons for Rejection:</h3>
      <ul style="padding-left: 20px;">
        <li style="margin: 10px 0; color: #4b5563;"><strong>Incomplete Documentation</strong> - Missing or unclear business registration documents</li>
        <li style="margin: 10px 0; color: #4b5563;"><strong>Information Mismatch</strong> - Inconsistencies in provided information</li>
        <li style="margin: 10px 0; color: #4b5563;"><strong>Image Quality</strong> - Photos that don't clearly show the facility</li>
        <li style="margin: 10px 0; color: #4b5563;"><strong>Location Restrictions</strong> - Area not currently covered by our service</li>
        <li style="margin: 10px 0; color: #4b5563;"><strong>Duplicate Registration</strong> - Facility already registered on our platform</li>
      </ul>
    </div>
    
    <h3 style="color: #374151;">What You Can Do:</h3>
    <p>If you believe this decision was made in error, or if you would like to resubmit your application with updated information and documentation, please don't hesitate to contact us.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{contactURL}" style="display: inline-block; background-color: #3B82F6; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">Contact Support →</a>
    </div>
    
    <p style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; border-left: 4px solid #3B82F6;">
      <strong> Tip:</strong> When resubmitting, ensure all documents are clear, complete, and match the information provided in your application.
    </p>
    
    <p style="margin-top: 30px;">
      We appreciate your understanding and interest in PlayPal.
    </p>
    
    <p>
      Best regards,<br>
      <strong>The PlayPal Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p>© 2024 PlayPal. All rights reserved.</p>
    <p>Need help? Email us at <a href="mailto:support@playpal.com" style="color: #3B82F6;">support@playpal.com</a></p>
  </div>
</body>
</html>
`;

const FUTSAL_OWNER_PENDING_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #F59E0B, #D97706); padding: 30px 20px; text-align: center;">
    <h1 style="color: white; margin: 0;"> Application Received</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 40px 30px;">
    <h2 style="color: #374151; margin-top: 0;">Hello {ownerName},</h2>
    
    <p>Thank you for submitting your registration for <strong>{futsalName}</strong>!</p>
    
    <div style="background-color: #FFFBEB; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 0;"><strong>Your application is currently under review.</strong></p>
      <p style="margin: 10px 0 0 0;">Our team will carefully review your documents and information. This process typically takes 1-3 business days.</p>
    </div>
    
    <p>We'll notify you via email once a decision has been made.</p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #374151; margin-top: 0;">Submitted Information:</h3>
      <p style="margin: 5px 0;"><strong>Futsal Name:</strong> {futsalName}</p>
      <p style="margin: 5px 0;"><strong>Location:</strong> {futsalLocation}</p>
      <p style="margin: 5px 0;"><strong>Submitted On:</strong> {submittedDate}</p>
    </div>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>The PlayPal Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p>© 2024 PlayPal. All rights reserved.</p>
  </div>
</body>
</html>
`;

const ADMIN_NEW_REGISTRATION_NOTIFICATION = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Registration Pending</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #3B82F6, #2563EB); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;"> New Futsal Registration</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 30px;">
    <h2 style="color: #374151;">New Registration Awaiting Approval</h2>
    
    <p>A new futsal owner has registered and is awaiting your review.</p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
      <h3 style="margin-top: 0; color: #374151;">Registration Details:</h3>
      <p style="margin: 8px 0;"><strong>Owner Name:</strong> {ownerName}</p>
      <p style="margin: 8px 0;"><strong>Email:</strong> {ownerEmail}</p>
      <p style="margin: 8px 0;"><strong>Phone:</strong> {ownerPhone}</p>
      <p style="margin: 8px 0;"><strong>Futsal Name:</strong> {futsalName}</p>
      <p style="margin: 8px 0;"><strong>Location:</strong> {futsalLocation}</p>
      <p style="margin: 8px 0;"><strong>Business Contact:</strong> {businessContact}</p>
      <p style="margin: 8px 0;"><strong>Submitted:</strong> {submittedDate}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{reviewURL}" style="display: inline-block; background-color: #10B981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Review Application →</a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Please review the application and all submitted documents in the admin dashboard.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>PlayPal Admin System</p>
  </div>
</body>
</html>
`;

module.exports = {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  FUTSAL_OWNER_APPROVAL_TEMPLATE,
  FUTSAL_OWNER_REJECTION_TEMPLATE,
  FUTSAL_OWNER_PENDING_TEMPLATE,
  ADMIN_NEW_REGISTRATION_NOTIFICATION
};