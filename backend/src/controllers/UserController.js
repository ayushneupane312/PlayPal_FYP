
const User = require ("../models/UserModel.js");


// Get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Delete a user by ID
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user is a guesthouse owner
        if (user.role === "guesthouse owner") {
            const owner = await GuesthouseOwner.findOne({ userId: user._id });

            if (owner) {
                // Delete all guesthouses owned by this owner
                await Guesthouse.deleteMany({ owner: owner._id });

                // Delete the GuesthouseOwner document
                await GuesthouseOwner.findByIdAndDelete(owner._id);
            }
        }

        // Delete the User document
        await User.findByIdAndDelete(user._id);

        res.status(200).json({ message: "User and related data deleted successfully" }); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};