const axios = require('axios');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// =============== LOCAL SIGNUP ================
// This function is fine as-is.
const signup = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Provide all details' });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Signup successful', user: { username } });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// =============== LOCAL LOGIN ================
// This function is fine as-is. It sends JSON, not a redirect, so no race condition.
const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Provide all details' });

  try {
    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    req.session.userId = user._id;
    // We should save the session here too for maximum consistency.
    req.session.save((err) => {
        if (err) {
            console.error('Session save error on local login:', err);
            return res.status(500).json({ message: 'Login failed, could not save session.' });
        }
        res.json({ message: 'Login successful', token });
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// =============== MAL OAUTH LOGIN ================
const malLogin = async (req, res) => {
  try {
    // ✅ ROBUSTNESS FIX: Validate that the session user actually exists in the DB.
    if (!req.session.userId) {
      console.error("MAL login attempted without a session userId.");
      return res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.error("MAL login attempted with a stale/invalid session userId.");
      // Destroy the bad session and force re-login.
      req.session.destroy(() => {
        res.redirect(`${process.env.FRONTEND_URL}/login`);
      });
      return; // Exit the function after starting the destroy/redirect.
    }

    const state = crypto.randomBytes(32).toString('hex');
    const codeVerifier = crypto.randomBytes(64).toString('base64url');

    req.session.state = state;
    req.session.codeVerifier = codeVerifier;

    const redirectUri = process.env.MAL_REDIRECT_URI;
    const url = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${process.env.MAL_CLIENT_ID}&state=${state}&code_challenge=${codeVerifier}&code_challenge_method=plain&redirect_uri=${redirectUri}`;

    // ✅ FIX: Save the session BEFORE redirecting to prevent race conditions.
    req.session.save((err) => {
      if (err) {
        console.error('Session save error before MAL redirect:', err);
        return res.status(500).send('Failed to prepare session for MAL login.');
      }
      res.redirect(url);
    });
  } catch (error) {
    console.error('Error during MAL login prep:', error);
    res.status(500).send('An error occurred while preparing for MyAnimeList login.');
  }
};

// =============== MAL OAUTH CALLBACK ================
const malCallback = async (req, res) => {
  const { code, state } = req.query;
  const session = req.session;

  if (!session || !session.userId) {
    return res.status(400).send('Session expired or is invalid.');
  }
  if (!code || !state || state !== session.state) {
    return res.status(400).send('Invalid request or state mismatch.');
  }

  try {
    const tokenResponse = await axios.post(
      'https://myanimelist.net/v1/oauth2/token',
      new URLSearchParams({
        client_id: process.env.MAL_CLIENT_ID,
        client_secret: process.env.MAL_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        code_verifier: session.codeVerifier,
        redirect_uri: process.env.MAL_REDIRECT_URI,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const { access_token, refresh_token, token_type, expires_in } = tokenResponse.data;

    const userResponse = await axios.get('https://api.myanimelist.net/v2/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const malData = userResponse.data;

    // Update the user in the database.
    await User.findByIdAndUpdate(session.userId, {
      mal: {
        username: malData.name,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenType: token_type,
        expiresAt: Date.now() + expires_in * 1000,
      },
      malUsername: malData.name,
      malAuthenticated: true,
    });

    // Update the live session object.
    session.malAuthenticated = true;
    session.malUsername = malData.name;

    // ✅✅✅ THE CRITICAL FIX ✅✅✅
    // Save the final, updated session BEFORE redirecting.
    req.session.save((err) => {
      if (err) {
        console.error('Session save error after MAL callback:', err);
        return res.status(500).send('Failed to save session.');
      }
      console.log('Final session saved after MAL. Redirecting to home.');
      res.redirect(`${process.env.FRONTEND_URL}/home`);
    });

  } catch (error) {
    console.error('❌ MAL OAuth error:', error.response?.data || error.message);
    res.status(500).send('Failed to authenticate with MyAnimeList.');
  }
};


// =============== REFRESH MAL TOKEN ================
const refreshMalToken = async (user) => {
  if (!user.mal?.refreshToken) {
    throw new Error("User has no MAL refresh token.");
  }

  try {
    const res = await axios.post('https://myanimelist.net/v1/oauth2/token', new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: user.mal.refreshToken,
      client_id: process.env.MAL_CLIENT_ID,
      client_secret: process.env.MAL_CLIENT_SECRET,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, refresh_token, expires_in } = res.data;

    user.mal.accessToken = access_token;
    user.mal.refreshToken = refresh_token;
    user.mal.expiresAt = Date.now() + expires_in * 1000;
    user.malTokenExpiry = Date.now() + expires_in * 1000;
    delete user.mal.expiresIn; // Remove if it exists
    await user.save();

    console.log("✅ MAL token refreshed successfully");
    return access_token;
  } catch (err) {
    console.error("❌ Failed to refresh MAL token:", err.response?.data || err.message);
    throw new Error("Failed to refresh MAL token");
  }
};

// =============== SESSION VALIDATION ================
const checkAuth = (req, res) => {
  if (req.session.userId) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
};

// =============== LOGOUT ================
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
};

// =============== EXPORTING CONTROLLER FUNCTIONS ================
module.exports = {
  signup,
  login,
  malLogin,
  malCallback,
  checkAuth,
  logout,
  refreshMalToken,
};
