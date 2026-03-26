const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false 
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verificationToken: String,
    verificationTokenExpires: Date,
    
    profileImage: {
        type: String,
        default: ""
    },
    // Used to invalidate existing JWT sessions (e.g., after password change)
    tokenVersion: {
        type: Number,
        default: 0,
    },
    role: {
        type: String,
        enum: ["player", "futsalowner", "admin"],
        default: "player"
    },
    
    // ✅ NEW: Application status for futsal owners
    applicationStatus: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none"
    },
    
    // ✅ NEW: Link to futsal owner registration
    futsalOwnerRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FutsalOwner'
    },
    
    // ✅ NEW: Flag if registration form is completed
    registrationCompleted: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ["active", "inactive", "suspended"],
        default: "inactive"
    },

    playerId: String,
    ownerId: String,

}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log("Password hashed in pre-save hook");
        next();
    } catch (error) {
        console.error("Error hashing password:", error);
        next(error);
    }
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ NEW: Method to check if user can login
userSchema.methods.canLogin = function() {
    // Players and admins can login once verified
    if (this.role === 'player' || this.role === 'admin') {
        return this.isVerified;
    }
    
    // Futsal owners need verification AND approval
    if (this.role === 'futsalowner') {
        return this.isVerified && this.applicationStatus === 'approved';
    }
    
    return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;