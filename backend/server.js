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
}));

app.use(express.json());

// This setting tells Express globally to trust the 'X-Forwarded-Proto' header from Render's proxy.
// It should come before the session middleware.
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
  }),
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'None',
    maxAge: 24 * 60 * 60 * 1000,
  },
  // ✅✅✅ THIS IS THE FINAL FIX ✅✅✅
  // This tells express-session to trust the proxy and ensures 'secure: true'
  // and 'sameSite: "None"' work correctly in the Render environment.
  proxy: true
}));


connectDB();

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

app.get('/debug-session', (req, res) => {
  res.json({
    session: req.session,
    cookies: req.headers.cookie,
  });
});


// ✅ 10. Global error handler
app.use((err, req, res, next) => {
  res.status(500).send('Server Error: Something went wrong.');
});

// ✅ 11. Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

