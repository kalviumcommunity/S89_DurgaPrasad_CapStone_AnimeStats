// authRoutes
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const googleAuthController = require('../controllers/googleAuthController');


router.post('/local/signup', authController.localSignup);
router.post('/local/login', authController.localLogin);


router.get('/login', (req, res, next) => {
  if (!req.session.userId) {a
    
    res.setHeader('Set-Cookie', [`connect.sid=${req.sessionID}; Path=/; HttpOnly; SameSite=Lax`]);
    console.log(' Explicitly setting cookie on /auth/login:', req.sessionID);
  } else {
    console.log(' Session found on /auth/login:', req.session.userId);
  }
  next();
}, authController.login);
router.get('/callback', authController.callback);


router.get('/google/login', googleAuthController.googleLogin);
router.get('/google/callback', googleAuthController.googleCallback);


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