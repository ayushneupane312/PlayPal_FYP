const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbConnect = require("./config/dbConnect");
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
}

// Create futsal uploads subdirectories
const futsalDirs = [
    path.join(__dirname, 'uploads/futsal/business-docs'),
    path.join(__dirname, 'uploads/futsal/citizenship-docs'),
    path.join(__dirname, 'uploads/futsal/ground-images')
];

futsalDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log('✅ Created directory:', dir);
    }
});

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ✅ Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('✅ Static files served from:', path.join(__dirname, 'uploads'));

// Routes
const authRoutes = require('./routes/AuthRoutes');
app.use('/auth', authRoutes);

const userRoutes = require('./routes/UserRoutes');
app.use('/users', userRoutes);

const uploadRoutes = require('./routes/AdminRoute');
app.use('/upload', uploadRoutes);

// ✅ Futsal Owner Routes
const formRoutes = require('./routes/FormRoute');
app.use('/futsal-owners', formRoutes);

// Default route
app.get('/', (req, res) => res.send('PlayPal API is running!'));

// Error handling - ADD DETAILED LOGGING
app.use((err, req, res, next) => {
  console.error('=== ERROR DETAILS ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('=====================');
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// DB connection
dbConnect();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('====================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
    console.log('====================================');
});