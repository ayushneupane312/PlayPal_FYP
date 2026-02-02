const express = require("express");

const userrouter = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require("../controllers/UserController.js");


// Get all users with filters
userrouter.get("/", getUsers);

// Get single user by ID
userrouter.get("/:id", getUserById);

// Create new user
userrouter.post("/", createUser);

// Update user
userrouter.put("/:id", updateUser);

// Delete user
userrouter.delete("/:id", deleteUser);

module.exports = userrouter;