const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

// Load environment variables or config
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/auth/google/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Initialize OAuth client
const oAuth2Client = new OAuth2Client(
  googleClientId,
  googleClientSecret,
  googleRedirectUri
);

// Google login route
const googleLogin = (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'online',
    scope: ['profile', 'email'],
    redirect_uri: googleRedirectUri,
  });
  res.redirect(url);
};

// Google callback route
const googleCallback = async (req, res) => {
  const { code } = req.query;

  try {
    // Get the access token
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Verify the ID token and get user info
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create the user
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
    }
    if (user) {
      user.googleId = user.googleId || googleId;
      user.name = user.name || name;
      user.profilePicture = user.profilePicture || picture;
      await user.save();
    } else {
      let username = (name || 'user').toLowerCase().replace(/\s+/g, '');
      let userExists = await User.findOne({ username });
      while (userExists) {
        username = `${username}${Math.floor(Math.random() * 1000)}`;
        userExists = await User.findOne({ username });
      }
      user = await new User({
        googleId, email, name, username, profilePicture: picture,
      }).save();
    }

    // Set all the session data
    req.session.userId = user._id;
    req.session.isAuthenticated = true;
    req.session.googleName = name;
    req.session.googleEmail = email;
    req.session.googlePicture = picture;

    // ✅✅✅ THIS IS THE CRITICAL FIX ✅✅✅
    // We now wrap our redirects in `req.session.save()` to guarantee the session
    // is saved before we send the response. This ensures the Set-Cookie header is attached.

    // Check if the user has already connected their MyAnimeList account
    if (!user.malUsername) {
      // If not connected, save the session, THEN redirect to MyAnimeList login
      req.session.save((err) => {
        if (err) {
          console.error('Session save error before MAL redirect:', err);
          return res.status(500).send('Failed to save session.');
        }
        console.log('Session saved successfully. Redirecting to /auth/login for MAL');
        res.redirect('/auth/login');
      });
    } else {
      // If already connected, save the session, THEN redirect to the frontend
      req.session.save((err) => {
        if (err) {
          console.error('Session save error before home redirect:', err);
          return res.status(500).send('Failed to save session.');
        }
        console.log('Session saved successfully. Redirecting to home.');
        // This log will now show the real cookie header
        console.log('Final Set-Cookie Header from Express:', res.getHeader('Set-Cookie'));
        res.redirect(`${FRONTEND_URL}/home`);
      });
    }

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).send('Google authentication failed.');
  }
};

module.exports = {
  googleLogin,
  googleCallback,
};