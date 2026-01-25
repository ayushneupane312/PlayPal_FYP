const User = require ("../models/UserModel.js");
const bcrypt= require ( "bcryptjs");
const crypto = require("crypto");
const storeSchema = require ('../models/store.js');
const fs = require('fs');

const { generateTokenAndSetCookie } = require ("../utils/generateTokenAndSetCookie.js");
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetSuccessEmail, sendPasswordResetEmail} = require ("../mailtrap/emails")

// ------------------- SIGNUP -------------------
const signup = async (req, res) => {
    console.log("Signup request body:", req.body);
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

        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password,
            verificationToken,
            verificationTokenExpires: Date.now() + 10 * 60 * 1000, // 10 min
            role: userType,
            isVerified: false, 
        });

        await user.save();

        generateTokenAndSetCookie(res, user._id);

        console.log("User saved to database:", user.email);
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            msg: "User registered successfully. Please verify your email.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
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
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: { ...user._doc, password: undefined },
        });
    } catch (error) {
        console.error("VerifyEmail error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

//LOGIN 
const login = async (req, res) => {
    try {
        console.log("Login request body:", req.body);

        const { email, password } = req.body;
       
        const user = await User.findOne({ 
            email: email.toLowerCase().trim()
        });
        
        if (!user) {
            console.log("User not found");
            return res.status(400).json({ 
                success: false, 
                msg: "No account found with this email address" 
            });
        }

        // Check if user verified email
        if (!user.isVerified) {
            console.log("Email not verified");
            return res.status(400).json({ 
                success: false, 
                msg: "Please verify your email before logging in" 
            });
        }

        const isPasswordValid = await user.matchPassword(password);
        if (!isPasswordValid) {
            console.log("Password mismatch");
            return res.status(400).json({ 
                success: false, 
                msg: "Incorrect password. Please try again" 
            });
        }
        
        generateTokenAndSetCookie(res, user._id);
        user.lastLogin = new Date();
        await user.save();

        console.log("User logged in successfully:", user.email);

        return res.status(200).json({
            success: true,
            msg: "Logged in successfully",
            user: {    
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
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

const checkAuth = async (req, res) => {

    try {

        const user = await User.findById(req.userId).select("-password");

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });

    } catch (error) {
        console.log("error in checkAuth ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }

}


// ------------------- LOGOUT -------------------
const logout = async (req, res) => {
    res.clearCookie("token", { httpOnly: true, sameSite: "none", secure: true });
    res.status(200).json({ msg: "Logged out successfully" });
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        //test reset link

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        console.log("Password Reset Link:", resetLink);
        await sendPasswordResetEmail(user.email, resetLink);

        //await sendPasswordResetEmail(user.email, `${process.env.FRONTEND_URL}reset-password/${resetToken}`);
        res.status(200).json({ msg: 'Password reset link sent' });
    }
    catch (error) {
        console.log("error in forgotPassword ", error);
        res.status(500).json({ msg: error.message });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

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

        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.log("Error in resetPassword ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

const uploadFile = async (req, res) => {

    try {
        // Check if file exists first
        if (!req.file) {
            console.log('ERROR: No file uploaded');
            console.log('Possible issue: field name mismatch or file not selected');
            return res.status(400).json({ 
                success: false, 
                msg: 'No file uploaded. Make sure the field name is "file"' 
            });
        }

        // Rest of your code...
    } catch (error) {
        console.error("=== UPLOAD ERROR ===");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
       
        
        res.status(500).json({ success: false, msg: error.message });
    }
};

const getAllStore = async (req, res) => {
    console.log('=== GET ALL STORE REQUEST ===');
    console.log('Query params:', req.query);
  

    const { user_id } = req.query;

    try {
        if (!user_id) {
            return res.status(400).json({ success: false, msg: 'user_id is required' });
        }

        const store = await Store.find({ user_id });
        console.log('Found stores:', store.length);
        
        res.status(200).json({ success: true, data: store });
    } catch (error) {
        console.error("=== GET STORE ERROR ===");
        console.error("Error:", error.message);

        res.status(500).json({ success: false, msg: error.message });
    }
};



module.exports = {
    signup,
    verifyEmail,
    login,
    logout,
    checkAuth,
    forgotPassword,
    resetPassword,
    uploadFile,
    getAllStore,
};