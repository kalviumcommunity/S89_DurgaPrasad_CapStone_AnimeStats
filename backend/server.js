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

// ✅ 1. Enable CORS for frontend
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:5173', 'https://animestats89.netlify.app'];
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ 2. Parse JSON bodies
app.use(express.json());

// ✅ 3. Session setup with serialization fix
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
    unserialize: (session) => session
  }),
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ✅ 4. Trust proxy if needed
app.set('trust proxy', 1);


// ✅ 5. Connect to MongoDB
connectDB();

// ✅ 6. Define routes
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/anime', animeRoutes);
app.use('/api/user/watchlist', watchlistRoutes);
app.use('/api/stats', statsRoutes);

// ✅ 7. Root test route
app.get('/', (req, res) => {
  res.send('Anime Watchlist Tracker Backend Running! 🚀');
});


// ✅ 9. Test OAuth UI
app.get('/test-oauth', (req, res) => {
  res.send(`
    <h1>Test MyAnimeList OAuth</h1>
    <p>Click below to test login:</p>
    <a href="/auth/login" style="padding:10px 20px;background:#2e51a2;color:white;border-radius:4px;text-decoration:none;">Login with MyAnimeList</a>
    <p>Then check: <a href="/debug-session">debug-session</a></p>
  `);
});

// ✅ 10. Global error handler
app.use((err, req, res, next) => {
  res.status(500).send('Server Error: Something went wrong.');
});

// ✅ 11. Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

