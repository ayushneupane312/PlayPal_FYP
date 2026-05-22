const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (res, userId, tokenVersion = 0) => {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY is not defined in .env");
  }

  const token = jwt.sign({ id: userId, tokenVersion }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });

  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    // Cross-origin: frontend (playpal-web) + API (playpal-fyp) need SameSite=None
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

module.exports = { generateTokenAndSetCookie };