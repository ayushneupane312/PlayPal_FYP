const express = require("express");
const { signup, login, logout, verifyEmail,checkAuth } = require("../controllers/AuthControllers.js");
const verifyToken = require("../middlewares/verifyToken.js");

const router = express.Router();

router.get('/check-auth', verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email",verifyEmail);






module.exports = router;