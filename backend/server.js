require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const animeRoutes = require('./routes/animeRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173'];
    console.log('CORS Origin:', origin); // Log the origin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Location'],
}));

// Configure session middleware with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'anime-stats-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URL,
    ttl: 24 * 60 * 60, // 1 day
    autoRemove: 'native',
    touchAfter: 24 * 3600, // 24 hours
    stringify: false,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: false, // Set to true in production if using HTTPS
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  }
}));

app.use(express.json());

// Trust the first proxy if behind a proxy
app.set('trust proxy', 1);

// Debug middleware to log session data
app.use((req, res, next) => {
  console.log('=== Session Debug (All Requests) ===');
  console.log('Session ID:', req.sessionID);
  console.log('Session Data:', {
    state: req.session.state,
    codeVerifier: req.session.codeVerifier,
    authStartTime: req.session.authStartTime,
    codeUsed: req.session.codeUsed,
    callbackProcessed: req.session.callbackProcessed
  });
  console.log('===================================');
  next();
});

// MongoDB Connection
connectDB();

// Routes


app.use('/auth', authRoutes); // Your authentication routes (including Google)
app.use('/api/user', userRoutes); // Your user routes
app.use('/api/anime', animeRoutes);
app.use('/api/user/watchlist', watchlistRoutes);
app.use('/api/stats', statsRoutes);

// Default Route
app.get('/', (req, res) => {
  res.send('Anime Watchlist Tracker Backend Running! 🚀');
});

// Debug route to check session
app.get('/debug-session', (req, res) => {
  res.json(req.session);
});

// Test route to initiate OAuth flow
app.get('/test-oauth', (req, res) => {
  res.send(`
    <h1>Test MyAnimeList OAuth</h1>
    <p>Click the button below to test the OAuth flow:</p>
    <a href="/auth/login" style="display: inline-block; padding: 10px 20px; background-color: #2e51a2; color: white; text-decoration: none; border-radius: 4px;">Login with MyAnimeList</a>
    <p>After login, check the <a href="/debug-session">session data</a>.</p>
  `);
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('=== Error Details ===');
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  console.error('Session ID:', req.sessionID);
  console.error('Session Data:', req.session);
  console.error('=====================');
  res.status(500).send('Server Error: An unexpected error occurred.');
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});