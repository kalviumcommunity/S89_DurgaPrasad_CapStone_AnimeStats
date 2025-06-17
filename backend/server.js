require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const animeRoutes = require('./routes/animeRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Parse JSON bodies
app.use(express.json());

// ✅ Configure sessions with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'anime-stats-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URL,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60,
    autoRemove: 'native',
    touchAfter: 24 * 3600,
    stringify: false,
    serialize: (session) => session,
    unserialize: (session) => session,
  }),
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  }
}));

// ✅ Trust proxy if behind a proxy
app.set('trust proxy', 1);

// ✅ Remove verbose session logging
// (Safe for production — removed all detailed session console logs)

// ✅ Connect to MongoDB
connectDB();

// ✅ Register routes
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/anime', animeRoutes);
app.use('/api/user/watchlist', watchlistRoutes);
app.use('/api/stats', statsRoutes);

// ✅ Root test route
app.get('/', (req, res) => {
  res.send('Anime Watchlist Tracker Backend Running! 🚀');
});

// ✅ Optional: Remove in production
app.get('/debug-session', (req, res) => {
  res.json({ sessionActive: !!req.session.userId });
});

// ✅ Optional test route for OAuth — remove in production
app.get('/test-oauth', (req, res) => {
  res.send(`
    <h1>Test MyAnimeList OAuth</h1>
    <a href="/auth/login" style="padding:10px 20px;background:#2e51a2;color:white;border-radius:4px;text-decoration:none;">Login with MyAnimeList</a>
  `);
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).send('Server Error: Something went wrong.');
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
