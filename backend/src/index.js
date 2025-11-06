const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const dbConnect = require("./config/dbConnect");
// const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Import routes
const authRoutes = require('./routes/AuthRoutes');

// Use routes
app.use('/api/auth', authRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('PlayPal API is running!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Port configuration

const PORT = process.env.PORT || 5000;
dbConnect();  

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});