const User = require ("../models/UserModel.js");
const bcrypt= require ( "bcryptjs");
const { generateTokenAndSetCookie } = require ("../utils/generateTokenAndSetCookie.js");
//const { sendVerificationEmail, sendWelcomeEmail } = require ( "../mail/mailtrapClient.js");

// ------------------- SIGNUP -------------------
const signup = async (req, res) => {
    console.log("Signup request body:", req.body);
    const { name, email, password, userType } = req.body;

    try {
        if (!name || !email || !password || !userType)
            return res.status(400).json({ msg: "Please fill in all fields" });

        if (!["student", "teacher", "admin", "parent"].includes(userType))
            return res.status(400).json({ msg: "Invalid role" });

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) return res.status(400).json({ msg: "User already exists" });

        //const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            verificationToken,
            verificationTokenExpires: Date.now() + 10 * 60 * 1000, // 10 min
            userType,
            isVerified: false, // email verification pending
        });

        await user.save();

        // JWT cookie
        generateTokenAndSetCookie(res, user._id);
        console.log("User saved to database:", user.email);

        // Send verification email
        //await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            msg: "User registered successfully. Please verify your email.",
            // user: { ...user._doc, password: undefined },
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                userType: user.role,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ msg: error.message });
    }
};

// ------------------- VERIFY EMAIL -------------------
// const verifyEmail = async (req, res) => {
//     const { code } = req.body;

//     try {
//         const user = await User.findOne({
//             verificationToken: code,
//             verificationTokenExpires: { $gt: Date.now() },
//         });

//         if (!user)
//             return res.status(400).json({ success: false, message: "Invalid or expired verification code" });

//         user.isVerified = true;
//         user.verificationToken = undefined;
//         user.verificationTokenExpires = undefined;
//         await user.save();

//         await sendWelcomeEmail(user.email, user.name);

//         res.status(200).json({
//             success: true,
//             message: "Email verified successfully",
//             user: { ...user._doc, password: undefined },
//         });
//     } catch (error) {
//         console.error("VerifyEmail error:", error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// ------------------- LOGIN -------------------
const login = async (req, res) => {
    try {
        console.log("Login request body:", req.body);

        const { email, password } = req.body;

       
        if (!email || !password) {
            return res.status(400).json({ success: false, msg: "Please fill in all fields" });
        }

        // 2️⃣ Check if user exists in DB
        const user = await User.findOne({ 
            email: email.toLowerCase().trim()
         });
        if (!user) {
            console.log("User not found");
            return res.status(400).json({ success: false, msg: "Invalid credentials. User not found." });
        }

        // // 3️⃣ Check password match
        // const isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) {
        //     console.log("Password mismatch");
        //     return res.status(400).json({ success: false, msg: "Invalid credentials. Wrong password." });
        // }

        // // 4️⃣ Check if user verified email
        // if (!user.isVerified) {
        //     console.log("Email not verified");
        //     return res.status(400).json({ success: false, msg: "Please verify your email first" });
        // }

        const isPasswordValid = await user.matchPassword(password);
        if (!isPasswordValid) {
            console.log("Password mismatch");
            return res.status(400).json({ success: false, msg: "Invalid credentials. Wrong password." });
        }

        // 5️⃣ Generate token cookie
        generateTokenAndSetCookie(res, user._id);

        // 6️⃣ Update last login
        user.lastLogin = new Date();
        await user.save();

        console.log("User logged in successfully:", user.email);

        return res.status(200).json({
            success: true,
            msg: "Logged in successfully",
            // user: { ...user._doc, password: undefined },
               user: {    
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        userType: user.userType,
                        isVerified: user.isVerified,
                        lastLogin: user.lastLogin,
                    },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, msg: "Server error: " + error.message });
    }
};


// ------------------- LOGOUT -------------------
const logout = async (req, res) => {
    res.clearCookie("token", { httpOnly: true, sameSite: "none", secure: true });
    res.status(200).json({ msg: "Logged out successfully" });
};

module.exports = {
    signup,
  //  verifyEmail,
    login,
    logout,
};