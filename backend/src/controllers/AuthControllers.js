const User = require("../models/UserModel");

const jwt = require("jsonwebtoken");

const generateToken = id => jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(400).json({ message: "Invalid credentials" });
    res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { registerUser, loginUser };