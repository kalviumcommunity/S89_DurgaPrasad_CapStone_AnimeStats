// require('dotenv').config();
// const express = require('express');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');
// const axios = require('axios');
// const mongoose = require('mongoose');
// const crypto = require('crypto');
// const cors = require('cors');

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors({
//   origin: ['http://localhost:8080', 'http://localhost:3000'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// // Configure session middleware with MongoDB store
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'anime-stats-secret-key',
//   resave: true,
//   saveUninitialized: true,
//   store: MongoStore.create({
//     mongoUrl: process.env.MONGODB_URL,
//     ttl: 24 * 60 * 60, // 1 day
//     autoRemove: 'native',
//     touchAfter: 24 * 3600, // 24 hours
//     stringify: false,
//     collectionName: 'sessions'
//   }),
//   cookie: {
//     secure: false, // Set to true in production if using HTTPS
//     maxAge: 24 * 60 * 60 * 1000,
//     httpOnly: true,
//     sameSite: 'lax',
//     path: '/'
//   }
// }));

// // Trust the first proxy if behind a proxy
// app.set('trust proxy', 1);

// // Debug middleware to log session data
// app.use((req, res, next) => {
//   console.log('=== Session Debug (All Requests) ===');
//   console.log('Session ID:', req.sessionID);
//   console.log('Session Data:', {
//     state: req.session.state,
//     codeVerifier: req.session.codeVerifier, // Directly log codeVerifier
//     authStartTime: req.session.authStartTime,
//     codeUsed: req.session.codeUsed,
//     callbackProcessed: req.session.callbackProcessed
//   });
//   console.log('===================================');
//   next();
// });

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URL)
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch(err => console.error('❌ MongoDB connection error:', err));

// // Helper functions
// function generateCodeVerifier() {
//   const length = Math.floor(Math.random() * (128 - 43 + 1)) + 43;
//   return crypto.randomBytes(length)
//     .toString('base64')
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=/g, '')
//     .slice(0, length);
// }

// function generateCodeChallenge(codeVerifier) {
//   return crypto
//     .createHash('sha256')
//     .update(codeVerifier)
//     .digest('base64')
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=/g, '');
// }

// // Routes

// // Login Route
// // Login Route
// app.get('/auth/login', (req, res) => {
//   try {
//     const state = crypto.randomBytes(32).toString('hex');
//     const codeVerifier = generateCodeVerifier();
//     // For plain method, code_challenge is the same as code_verifier
//     const codeChallenge = codeVerifier;

//     req.session.regenerate((err) => {
//       if (err) {
//         console.error('Error regenerating session:', err);
//         return res.status(500).send('Error initializing authentication');
//       }

//       req.session.state = state;
//       req.session.codeVerifier = codeVerifier;
//       req.session.authStartTime = Date.now();
//       req.session.codeUsed = false;
//       req.session.callbackProcessed = false;

//       req.session.save((saveErr) => {
//         if (saveErr) {
//           console.error('Error saving session:', saveErr);
//           return res.status(500).send('Error saving session before redirect');
//         }

//         const authUrl = new URL('https://myanimelist.net/v1/oauth2/authorize');
//         authUrl.searchParams.append('response_type', 'code');
//         authUrl.searchParams.append('client_id', process.env.MAL_CLIENT_ID);
//         authUrl.searchParams.append('state', state);
//         authUrl.searchParams.append('code_challenge', codeChallenge);
//         authUrl.searchParams.append('code_challenge_method', 'plain'); // Set to 'plain'
//         authUrl.searchParams.append('redirect_uri', process.env.MAL_REDIRECT_URI);

//         console.log('=== Debug Login (Using PLAIN PKCE) ===');
//         console.log('Session ID:', req.sessionID);
//         console.log('State:', state);
//         console.log('Code Verifier:', codeVerifier);
//         console.log('Code Challenge (PLAIN):', codeChallenge);
//         console.log('Auth Start Time:', req.session.authStartTime);
//         console.log('======================================');

//         res.redirect(authUrl.toString());
//       });
//     });
//   } catch (error) {
//     console.error('Unexpected error in login route:', error);
//     res.status(500).send('An unexpected error occurred. Please try again.');
//   }
// });
// // Callback Route
// app.get('/auth/callback', async (req, res) => {
//   const { code, state } = req.query;

//   console.log('=== Debug Callback Information ===');
//   console.log('Session ID:', req.sessionID);
//   console.log('Query State:', state);
//   console.log('Session State:', req.session.state);
//   console.log('Session Code Verifier:', req.session.codeVerifier); // Log it directly here
//   console.log('Time Since Auth Start:', Date.now() - (req.session.authStartTime || 0));
//   console.log('==============================');

//   if (req.session.callbackProcessed) {
//     console.error('Duplicate callback request detected');
//     return res.status(400).send('Authentication Error: Duplicate Request');
//   }

//   if (!req.session.state || state !== req.session.state) {
//     console.error('State validation failed');
//     return res.status(400).send('Authentication Error: Invalid State');
//   }

//   const codeVerifier = req.session.codeVerifier; // Get from session

//   if (!codeVerifier) {
//     console.error('No code verifier found in session during callback');
//     return res.status(400).send('Authentication Error: Session Expired (No Code Verifier)');
//   }

//   if (req.session.codeUsed) {
//     console.error('Code has already been used');
//     return res.status(400).send('Authentication Error: Code Already Used');
//   }

//   const codeAge = Date.now() - (req.session.authStartTime || 0);
//   if (codeAge > 5 * 60 * 1000) {
//     console.error('Code has expired');
//     return res.status(400).send('Authentication Error: Code Expired');
//   }

//   try {
//     req.session.callbackProcessed = true;
//     await new Promise((resolve) => req.session.save(resolve));

//     console.log('=== Token Exchange Request ===');
//     console.log('Code:', code);
//     console.log('Code Verifier (from session):', codeVerifier); // Log the one being used
//     console.log('Redirect URI:', process.env.MAL_REDIRECT_URI);
//     console.log('Client ID:', process.env.MAL_CLIENT_ID);
//     console.log('============================');

//     req.session.codeUsed = true;
//     await new Promise((resolve) => req.session.save(resolve));

//     const formData = new URLSearchParams();
//     formData.append('client_id', process.env.MAL_CLIENT_ID);
//     formData.append('client_secret', process.env.MAL_CLIENT_SECRET);
//     formData.append('grant_type', 'authorization_code');
//     formData.append('code', code);
//     formData.append('redirect_uri', process.env.MAL_REDIRECT_URI);
//     formData.append('code_verifier', codeVerifier); // Use the one from the session

//     console.log('Form data being sent:', formData.toString());

//     const tokenResponse = await axios.post(
//       'https://myanimelist.net/v1/oauth2/token',
//       formData,
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'Accept': 'application/json'
//         },
//         validateStatus: (status) => status < 500,
//       }
//     );

//     if (tokenResponse.data.error) {
//       console.error('❌ Token error response:', tokenResponse.data);
//       if (tokenResponse.data.error === 'invalid_grant') {
//         console.log('Detected invalid_grant error - likely code or verifier issue');
//         req.session.destroy((err) => console.error('Error destroying session:', err));
//         return res.status(400).send('Authentication Error: Invalid Grant (Likely Code Verifier Issue)');
//       }
//       return res.status(400).send(`Authentication Error: ${tokenResponse.data.error_description || tokenResponse.data.error}`);
//     }

//     console.log('✅ Access Token received');

//     req.session.accessToken = tokenResponse.data.access_token;
//     req.session.refreshToken = tokenResponse.data.refresh_token;
//     req.session.tokenExpiry = Date.now() + (tokenResponse.data.expires_in * 1000);

//     delete req.session.state;
//     delete req.session.codeVerifier;
//     delete req.session.codeUsed;
//     delete req.session.callbackProcessed;

//     req.session.save((saveErr) => {
//       if (saveErr) {
//         console.error('Error saving session after token:', saveErr);
//         return res.status(500).send('Authentication Error: Error saving session');
//       }
//       res.send('<h2>Authentication Successful! 🎉</h2><p>You can close this window.</p><script>if (window.opener) { window.opener.postMessage({ type: \'AUTH_SUCCESS\' }, \'*\'); }</script>');
//     });
//   } catch (error) {
//     console.error('❌ Error exchanging code for token:', error.response?.data || error.message);
//     req.session.destroy((err) => console.error('Error destroying session:', err));
//     res.status(500).send('Authentication Error: Error during token exchange');
//   }
// });

// // Default Route
// app.get('/', (req, res) => {
//   res.send('Anime Watchlist Tracker Backend Running! 🚀');
// });

// // Debug route to check session
// app.get('/debug-session', (req, res) => {
//   res.json(req.session); // Simply send the whole session object
// });

// // Test route to initiate OAuth flow
// app.get('/test-oauth', (req, res) => {
//   res.send(`
//     <h1>Test MyAnimeList OAuth</h1>
//     <p>Click the button below to test the OAuth flow:</p>
//     <a href="/auth/login" style="display: inline-block; padding: 10px 20px; background-color: #2e51a2; color: white; text-decoration: none; border-radius: 4px;">Login with MyAnimeList</a>
//     <p>After login, check the <a href="/debug-session">session data</a>.</p>
//   `);
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('=== Error Details ===');
//   console.error('Error:', err);
//   console.error('Stack:', err.stack);
//   console.error('Session ID:', req.sessionID);
//   console.error('Session Data:', req.session);
//   console.error('=====================');
//   res.status(500).send('Server Error: An unexpected error occurred.');
// });

// // Start Server
// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });


require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure session middleware with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'anime-stats-secret-key',
  resave: true,
  saveUninitialized: true,
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
app.use('/auth', authRoutes);

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