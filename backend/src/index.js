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

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('✅ Static files served from:', path.join(__dirname, 'uploads'));

// Routes
const authRoutes = require('./routes/AuthRoutes');
app.use('/auth', authRoutes);

const userRoutes = require('./routes/UserRoutes');
app.use('/api/users', userRoutes);



const formRoutes = require('./routes/FormRoute');
app.use('/futsal-owners', formRoutes);

const venueRoutes = require('./routes/VenueRoute');
app.use('/venue', venueRoutes);

const uploadRoutes = require("./routes/UploadRoute");
app.use("/api/upload", uploadRoutes);





// Default route
app.get('/', (req, res) => res.send('PlayPal API is running!'));

// Error handling - ADD DETAILED LOGGING
app.use((err, req, res, next) => {
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
    
    console.log(`API URL: http://localhost:${PORT}`);
   
});