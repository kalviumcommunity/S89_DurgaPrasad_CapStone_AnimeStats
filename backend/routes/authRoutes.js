
// authRoutes.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const googleAuthController = require('../controllers/googleAuthController');

// Local Authentication Routes
router.post('/local/signup', authController.localSignup);
router.post('/local/login', authController.localLogin);

// MyAnimeList OAuth Routes
router.get('/login', (req, res, next) => {
  // Debugging: Log session status before proceeding to MAL OAuth login
  if (!req.session.userId) {
    console.log('No user ID in session for /auth/login. Proceeding with potential new session setup.');
    // The `connect-mongo` store handles setting the session ID cookie.
    // Explicitly setting it here is usually not necessary unless you have a specific edge case
    // where you need to force-set it before the response is fully handled by session middleware.
    // For general flow, the session middleware manages this.
    // res.setHeader('Set-Cookie', [`connect.sid=${req.sessionID}; Path=/; HttpOnly; SameSite=Lax`]);
    // console.log('Explicitly setting cookie on /auth/login:', req.sessionID);
  } else {
    console.log('Session found on /auth/login. User ID:', req.session.userId);
  }
  next();
}, authController.login); // This is likely your MAL OAuth initiation route
router.get('/callback', authController.callback); // This is likely your MAL OAuth callback route

// Google OAuth Routes
router.get('/google/login', googleAuthController.googleLogin);
router.get('/google/callback', googleAuthController.googleCallback);

// Session Status Endpoint (for frontend to check authentication state)
router.get('/session', (req, res) => {
  console.log('Checking session status for /session endpoint.');
  console.log('Current Session ID:', req.sessionID);
  console.log('Session Data:', req.session);

  if (req.session.userId) {
    return res.json({
      isAuthenticated: true,
      userId: req.session.userId,
      // Include Google OAuth specific info if available
      googleName: req.session.googleName || null,
      googleEmail: req.session.googleEmail || null,
      // Include MyAnimeList OAuth specific info if available
      malAuthenticated: req.session.malAuthenticated || false,
      malUsername: req.session.malUsername || null,
    });
  } else {
    console.log('Session not authenticated. No userId found in session.');
    return res.status(401).json({ isAuthenticated: false });
  }
});

module.exports = router;