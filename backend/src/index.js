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
app.set('trust proxy', 1);

// Middleware — allow local dev + FRONTEND_URL (comma-separated) + Render URLs
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
]);

const addOrigin = (url) => {
  if (!url) return;
  const trimmed = url.trim().replace(/\/$/, '');
  if (trimmed) allowedOrigins.add(trimmed);
};

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach(addOrigin);
}
if (process.env.RENDER_EXTERNAL_URL) {
  addOrigin(process.env.RENDER_EXTERNAL_URL);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, '');
      if (allowedOrigins.has(normalized)) return callback(null, true);
      try {
        if (new URL(normalized).hostname.endsWith('.onrender.com')) {
          return callback(null, true);
        }
      } catch (_) {
        /* ignore invalid origin */
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
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

const paymentRoutes = require('./routes/PaymentRoutes');
app.use('/api/payment', paymentRoutes);

const adminFinancialRoutes = require('./routes/AdminFinancialRoutes');
app.use('/api/admin', adminFinancialRoutes);

const adminVenueRoutes = require('./routes/AdminVenueRoutes');
app.use('/api/admin/venues', adminVenueRoutes);





app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'playpal-api' });
});

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

const socketCorsOrigins = Array.from(allowedOrigins);

const io = new Server(server, {
  cors: {
    origin: socketCorsOrigins.length ? socketCorsOrigins : ['http://localhost:5173'],
    credentials: true,
  },
});

// Initialize notification socket handlers
initNotificationSocket(io);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`PlayPal API listening on ${HOST}:${PORT}`);
  if (process.env.RENDER_EXTERNAL_URL) {
    console.log(`Public URL: ${process.env.RENDER_EXTERNAL_URL}`);
  }
});

// Keep free-tier Render instance warm (optional; set ENABLE_SELF_PING=true)
if (process.env.ENABLE_SELF_PING === 'true' && process.env.RENDER_EXTERNAL_URL) {
  const pingUrl = `${process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '')}/health`;
  setInterval(() => {
    fetch(pingUrl).catch(() => {});
  }, 14 * 60 * 1000);
}