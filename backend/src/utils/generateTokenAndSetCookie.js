const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (res, userId) => {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY is not defined in .env");
  }

  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in production, false in dev
    sameSite: "strict", // Changed from "none" to "strict" for localhost
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

module.exports = { generateTokenAndSetCookie };