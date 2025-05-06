const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const googleAuthController = require('../controllers/googleAuthController');

// ============================
// MyAnimeList OAuth Routes
// ============================
router.get('/login', authController.login);
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
