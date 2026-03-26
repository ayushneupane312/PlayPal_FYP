const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbConnect = require("./config/dbConnect");
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const { initNotificationSocket } = require('./services/notificationService');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('✅ Static files served from:', path.join(__dirname, 'uploads'));

// DB connection
dbConnect();

// Routes
const authRoutes = require('./routes/AuthRoutes');
app.use('/auth', authRoutes);

const userRoutes = require('./routes/UserRoutes');
app.use('/api/users', userRoutes);



const formRoutes = require('./routes/FormRoute');
app.use('/futsal-owners', formRoutes);

const venueRoutes = require('./routes/VenueRoute');
app.use('/api/venue', venueRoutes);

const uploadRoutes = require("./routes/UploadRoute");
app.use("/api/upload", uploadRoutes);

const tournamentRoutes = require('./routes/TournamentRoutes');
app.use('/api/tournaments', tournamentRoutes);

const bookingRoutes = require('./routes/BookingRoute');
app.use('/api/bookings', bookingRoutes);

const teamRoutes = require('./routes/TeamRoutes');
app.use('/api/team', teamRoutes);

const matchmakingRoutes = require('./routes/MatchmakingRoutes');
app.use('/api/matchmaking', matchmakingRoutes);

const opponentMatchmakingRoutes = require('./routes/OpponentMatchmakingRoute');
app.use('/api/opponent-matchmaking', opponentMatchmakingRoutes);

const notificationRoutes = require('./routes/NotificationRoutes');
app.use('/api/notifications', notificationRoutes);

const endorsementRoutes = require('./routes/EndorsementRoutes');
app.use('/api/endorsements', endorsementRoutes);




// Default route
app.get('/', (req, res) => res.send('PlayPal API is running!'));

// Error handling - ADD DETAILED LOGGING
app.use((err, req, res, next) => {
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});



// Auto-cancel split payments past deadline (every 1 min)
const { startAutoCancelJob } = require('./services/splitPaymentAutoCancel');
startAutoCancelJob();

// Create HTTP server & Socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

// Initialize notification socket handlers
initNotificationSocket(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`API URL: http://localhost:${PORT}`);
});