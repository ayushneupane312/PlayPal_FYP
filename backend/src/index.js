const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbConnect = require("./config/dbConnect");
const dotenv = require('dotenv');
require('dotenv').config();


// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/AuthRoutes');
app.use('/auth', authRoutes);

// Default route
app.get('/', (req, res) => res.send('Acadex API is running!'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// DB connection
dbConnect();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));