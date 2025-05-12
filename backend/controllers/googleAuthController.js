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

    // Verify the ID token
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: googleClientId,
    });

    // Get user information from the payload
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if the user already exists using googleId, otherwise check by email
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
    }

    // If user exists, update their information, if needed
    if (user) {
      if (!user.googleId) user.googleId = googleId;
      if (!user.name) user.name = name;
      if (!user.profilePicture) user.profilePicture = picture;
      await user.save();
    } else {
      // Create a new user with random username
      let username = (name || 'user').toLowerCase().replace(/\s+/g, '');
      let userExists = await User.findOne({ username });
      while (userExists) {
        username = `${username}${Math.floor(Math.random() * 1000)}`;
        userExists = await User.findOne({ username });
      }

      user = await new User({
        googleId,
        email,
        name,
        username,
        profilePicture: picture,
      }).save();
    }

    //  Set session with complete login info
    req.session.userId = user._id;
    req.session.isAuthenticated = true;
    req.session.googleName = name;
    req.session.googleEmail = email;
    req.session.googlePicture = picture;

    // Check if the user has already connected their MyAnimeList account
    if (!user.malUsername) {
      // If not connected, redirect to MyAnimeList login to initiate the connection
      console.log('Redirecting to /api/auth/login for MAL');
      return res.redirect('/auth/login');
    } else {
      // If already connected, redirect to the dashboard
      console.log('Redirecting to dashboard');
      return res.redirect(`${FRONTEND_URL}/dashboard`);
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