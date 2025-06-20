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

app.use(express.json());

// This setting tells Express globally to trust the proxy. It's good to keep.
app.set('trust proxy', 1);

// Session setup with the final fix for platform interference.
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
    sameSite: 'None',
    maxAge: 24 * 60 * 60 * 1000,
    domain: '.onrender.com'
  },
  // ✅✅✅ THIS IS THE FINAL FIX ✅✅✅
  // This tells express-session to trust the X-Forwarded-Proto header
  // from Render's proxy, ensuring 'secure: true' works correctly.
  proxy: true
}));


connectDB();

app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/anime', animeRoutes);
app.use('/api/user/watchlist', watchlistRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
  res.send('Anime Watchlist Tracker Backend Running! 🚀');
});

app.get('/test-oauth', (req, res) => {
  res.send(`
    <h1>Test MyAnimeList OAuth</h1>
    <p>Click below to test login:</p>
    <a href="/auth/login" style="padding:10px 20px;background:#2e51a2;color:white;border-radius:4px;text-decoration:none;">Login with MyAnimeList</a>
    <p>Then check: <a href="/debug-session">debug-session</a></p>
  `);
});

app.use((err, req, res, next) => {
  res.status(500).send('Server Error: Something went wrong.');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  // You can keep or remove these test logs now that we know the deployment works.
  console.log('----------------------------------------------------');
  console.log('SERVER.JS DEPLOYMENT TEST V5 - IF YOU SEE THIS, THE NEW CODE IS LIVE!');
  console.log('----------------------------------------------------');
});