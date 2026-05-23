const express = require("express");
const { signup, login, logout, verifyEmail, resendVerificationEmail, checkAuth, updateMe, changePassword, forgotPassword, resetPassword } = require("../controllers/AuthControllers.js");
const verifyToken = require("../middlewares/verifyToken.js");

const router = express.Router();

router.get('/check-auth', verifyToken, checkAuth);
router.patch('/me', verifyToken, updateMe);
router.patch('/change-password', verifyToken, changePassword);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", verifyEmail);
router.post("/resend-verification", verifyToken, resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);






module.exports = router;