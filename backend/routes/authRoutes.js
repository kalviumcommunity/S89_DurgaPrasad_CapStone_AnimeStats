const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const googleAuthController = require('../controllers/googleAuthController');

// ============================
// MyAnimeList OAuth Routes
// ============================
router.get('/login', (req, res, next) => {
  if (!req.session.userId) {
    // Explicitly set the session cookie if no userId is found
    res.setHeader('Set-Cookie', [`connect.sid=${req.sessionID}; Path=/; HttpOnly; SameSite=Lax`]);
    console.log('⚠️ Explicitly setting cookie on /auth/login:', req.sessionID);
  } else {
    console.log('✅ Session found on /auth/login:', req.session.userId);
  }
  next();
}, authController.login);
router.get('/callback', authController.callback);

// ============================
// Google OAuth Routes
// ============================
router.get('/google/login', googleAuthController.googleLogin);
router.get('/google/callback', googleAuthController.googleCallback);

// ============================
// Session Check Route
// ============================
router.get('/session', (req, res) => {
  if (req.session.userId) {
    return res.json({
      isAuthenticated: true,
      userId: req.session.userId,
      googleName: req.session.googleName,
      googleEmail: req.session.googleEmail,
      malAuthenticated: req.session.malAuthenticated,
      malUsername: req.session.malUsername,
    });
  } else {
    return res.status(401).json({ isAuthenticated: false });
  }
});

module.exports = router;