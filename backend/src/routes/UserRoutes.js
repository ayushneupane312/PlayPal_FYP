const express = require ("express");

const {getUsers} = require ("../controllers/UserController.js");

const userrouter = express.Router();

userrouter.get ("/", getUsers);

module.exports = userrouter;
