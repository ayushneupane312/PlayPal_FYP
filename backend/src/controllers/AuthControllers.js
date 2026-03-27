const User = require("../models/UserModel.js");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { generateTokenAndSetCookie } = require("../utils/generateTokenAndSetCookie.js");
const { 
    sendVerificationEmail, 
    sendWelcomeEmail, 
    sendPasswordResetSuccessEmail, 
    sendPasswordResetEmail
} = require("../mailtrap/emails");

// ------------------- SIGNUP -------------------
const signup = async (req, res) => {
    const { name, email, password, userType } = req.body;

    try {
        // Check if all fields are provided
        if (!name || !email || !password || !userType)
            return res.status(400).json({ msg: "Please fill in all fields" });

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({ msg: "Password must be at least 6 characters long" });
        }
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ msg: "Password must contain at least one uppercase letter" });
        }
        if (!/[a-z]/.test(password)) {
            return res.status(400).json({ msg: "Password must contain at least one lowercase letter" });
        }
        if (!/\d/.test(password)) {
            return res.status(400).json({ msg: "Password must contain at least one number" });
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            return res.status(400).json({ msg: "Password must contain at least one special character" });
        }

        // Validate user type
        if (!["player", "futsalowner", "admin"].includes(userType))
            return res.status(400).json({ msg: "Invalid user type selected" });

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) 
            return res.status(400).json({ msg: "An account with this email already exists" });

        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        // Create user
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password,
            verificationToken,
            verificationTokenExpires: Date.now() + 10 * 60 * 1000,
            role: userType,
            isVerified: false,
            applicationStatus: 'none',
            registrationCompleted: false,
        });

        await user.save();
        generateTokenAndSetCookie(res, user._id, user.tokenVersion ?? 0);

        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            msg: "User registered successfully. Please verify your email.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                registrationCompleted: user.registrationCompleted,
                applicationStatus: user.applicationStatus,
                lastLogin: user.lastLogin,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ msg: "Something went wrong. Please try again" });
    }
};

// ------------------- VERIFY EMAIL -------------------
const verifyEmail = async (req, res) => {
    const { code } = req.body;

    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpires: { $gt: Date.now() },
        });

        if (!user)
            return res.status(400).json({ success: false, message: "Invalid or expired verification code" });

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        if (user.role === 'player') {
            user.status = 'active';
          }
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: { 
                ...user._doc, 
                password: undefined,
                needsRegistration: user.role === 'futsalowner' && !user.registrationCompleted
            },
        });
    } catch (error) {
        console.error("VerifyEmail error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ------------------- LOGIN -------------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                msg: "Please provide email and password"
            });
        }
       
        const user = await User.findOne({ 
            email: email.toLowerCase().trim()
        });
        
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                msg: "No account found with this email address" 
            });
        }

        if (!user.isVerified) {
            return res.status(400).json({ 
                success: false, 
                msg: "Please verify your email before logging in" 
            });
        }

        const isPasswordValid = await user.matchPassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ 
                success: false, 
                msg: "Incorrect password. Please try again" 
            });
        }

        // ✅ SET TOKEN BEFORE CHECKING FUTSAL OWNER STATUS
        generateTokenAndSetCookie(res, user._id, user.tokenVersion ?? 0);
        user.lastLogin = new Date();
        await user.save();

        // ✅ FUTSAL OWNER SPECIFIC CHECKS (after setting token)
        if (user.role === 'futsalowner') {
            if (!user.registrationCompleted) {
                return res.status(200).json({
                    success: false,
                    msg: "Please complete your futsal registration form first",
                    requiresRegistration: true,
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        profileImage: user.profileImage || "",
                        role: user.role,
                        isVerified: user.isVerified,
                        applicationStatus: user.applicationStatus,
                        registrationCompleted: user.registrationCompleted,
                        status: user.status,
                        lastLogin: user.lastLogin,
                    }
                });
            }

            if (user.applicationStatus === 'pending') {
                return res.status(200).json({
                    success: false,
                    msg: "Your application is pending admin approval.",
                    applicationStatus: 'pending',
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        profileImage: user.profileImage || "",
                        role: user.role,
                        isVerified: user.isVerified,
                        applicationStatus: user.applicationStatus,
                        registrationCompleted: user.registrationCompleted,
                        status: user.status,
                        lastLogin: user.lastLogin,
                    }
                });
            }

            if (user.applicationStatus === 'rejected') {
                return res.status(200).json({
                    success: false,
                    msg: "Your application has been rejected.",
                    applicationStatus: 'rejected',
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        profileImage: user.profileImage || "",
                        role: user.role,
                        isVerified: user.isVerified,
                        applicationStatus: user.applicationStatus,
                        registrationCompleted: user.registrationCompleted,
                        status: user.status,
                        lastLogin: user.lastLogin,
                    }
                });
            }

            if (user.applicationStatus === 'approved' && user.status !== 'active') {
                user.status = 'active';
                await user.save();
            }
        }

        return res.status(200).json({
            success: true,
            msg: "Logged in successfully",
            user: {    
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage || "",
                role: user.role,
                isVerified: user.isVerified,
                applicationStatus: user.applicationStatus,
                registrationCompleted: user.registrationCompleted,
                status: user.status,
                lastLogin: user.lastLogin,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ 
            success: false, 
            msg: "Something went wrong. Please try again" 
        });
    }
};

// ------------------- UPDATE CURRENT USER (profile) -------------------
const updateMe = async (req, res) => {
    try {
        const { name, profileImage, phone, location, preferredPosition, injuryImage, isInjured } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (typeof name === "string" && name.trim()) {
            user.name = name.trim();
        }
        if (typeof profileImage === "string") {
            user.profileImage = profileImage.trim();
        }
        if (typeof phone === "string") {
            user.phone = phone.trim();
        }
        if (typeof location === "string") {
            user.location = location.trim();
        }
        if (typeof preferredPosition === "string") {
            user.preferredPosition = preferredPosition.trim();
        }
        if (typeof injuryImage === "string") {
            user.injuryImage = injuryImage.trim();
            user.injuryUpdatedAt = injuryImage.trim() ? new Date() : user.injuryUpdatedAt;
        }
        if (typeof isInjured === "boolean") {
            user.isInjured = isInjured;
            user.injuryUpdatedAt = new Date();
        }

        await user.save();

        const safe = user.toObject();
        delete safe.password;

        res.status(200).json({
            success: true,
            user: {
                ...safe,
                needsRegistration: user.role === "futsalowner" && !user.registrationCompleted,
            },
        });
    } catch (error) {
        console.error("updateMe error:", error);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};

// ------------------- CHANGE PASSWORD -------------------
// Requires authentication (verifyToken middleware sets req.userId).
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body || {};

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: "currentPassword, newPassword and confirmPassword are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: "New password and confirmation do not match" });
        }

        // Basic password strength requirements
        const minLength = 8;
        const hasUppercase = /[A-Z]/.test(newPassword);
        const hasNumber = /\d/.test(newPassword);

        if (newPassword.length < minLength || !hasUppercase || !hasNumber) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters, include at least one uppercase letter and one number",
            });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 1) Verify current password
        const isCurrentValid = await user.matchPassword(currentPassword);
        if (!isCurrentValid) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        // 2) Ensure new password is not the same as old password (compare against existing hash)
        const isNewSameAsCurrent = await user.matchPassword(newPassword);
        if (isNewSameAsCurrent) {
            return res.status(400).json({ success: false, message: "New password must be different from the current password" });
        }

        // 3) Update password (pre-save hook will hash)
        user.password = newPassword;
        // 4) Invalidate existing tokens
        user.tokenVersion = (user.tokenVersion ?? 0) + 1;

        await user.save();

        // Clear auth cookie so user is forced to login again
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });

        return res.status(200).json({ success: true, message: "Password changed successfully. Please login again." });
    } catch (error) {
        console.error("changePassword error:", error);
        return res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};

// ------------------- CHECK AUTH -------------------
const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        
        res.status(200).json({ 
            success: true, 
            user: {
                ...user._doc,
                needsRegistration: user.role === 'futsalowner' && !user.registrationCompleted
            }
        });
    } catch (error) {
        console.error("Error in checkAuth:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ------------------- LOGOUT -------------------
const logout = async (req, res) => {
    res.clearCookie("token", { 
        httpOnly: true, 
        sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
        secure: process.env.NODE_ENV === 'production',
        path: '/'
    });
    res.status(200).json({ success: true, msg: "Logged out successfully" });
};

// ------------------- FORGOT PASSWORD -------------------
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    try {
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        
        if (!user) {
            return res.status(400).json({ success: false, message: 'No account found with this email' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        console.log(`Reset Link: ${resetLink}`);
                // ✅ Enhanced console logging for better visibility
        console.log('\n' + '='.repeat(80));
        console.log('🔐 PASSWORD RESET LINK GENERATED');
        console.log('='.repeat(80));
        console.log(`📧 Email: ${user.email}`);
        console.log(`🔗 Reset Link: ${resetLink}`);
    
        console.log(`⏱️  Valid for: 1 hour`);
     

        await sendPasswordResetEmail(user.email, resetLink);

        res.status(200).json({ success: true, message: 'Password reset link sent to your email' }); // ✅ Changed msg to message
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ------------------- RESET PASSWORD -------------------
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        await sendPasswordResetSuccessEmail(user.email);
        console.log ("Resent password link: ")

        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                msg: 'No file uploaded. Make sure the field name is "file"' 
            });
        }

        // Your upload logic here
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ success: false, msg: error.message });
    }
};

const getAllStore = async (req, res) => {
    const { user_id } = req.query;

    try {
        if (!user_id) {
            return res.status(400).json({ success: false, msg: 'user_id is required' });
        }

        const store = await Store.find({ user_id });
        res.status(200).json({ success: true, data: store });
    } catch (error) {
        console.error("Get store error:", error);
        res.status(500).json({ success: false, msg: error.message });
    }
};

module.exports = {
    signup,
    verifyEmail,
    login,
    logout,
    checkAuth,
    updateMe,
    changePassword,
    forgotPassword,
    resetPassword,
    uploadFile, 
    getAllStore
};