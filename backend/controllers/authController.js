// authController.js
const crypto = require('crypto');
const axios = require('axios');
const bcrypt = require('bcrypt');
const { clientId, clientSecret, redirectUri, authorizationUrl, tokenUrl } = require('../config/myAnimeListOAuth.js');
const { generateCodeVerifier } = require('../utils/authUtils');
const User = require("../models/User.js");

const saltRounds = 10;

const localSignup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide username, email, and password.' });
  }

  try {
    // Check if username or email already exists  
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with password
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Log the user in after signup 
    req.session.userId = savedUser._id;
    req.session.isAuthenticated = true;
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session after signup:', err);
        return res.status(500).json({ message: 'Error saving session.' });
      }
      return res.status(201).json({ message: 'Signup successful. Redirecting...', user: { _id: savedUser._id, username: savedUser.username, email: savedUser.email } });
    });

  } catch (error) {
    console.error('Error during local signup:', error);
    return res.status(500).json({ message: 'Error creating user.' });
  }
};

const localLogin = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Please provide username/email and password.' });
  }

  try {
    // Find user by username or email
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Login successful, set session
      req.session.userId = user._id;
      req.session.isAuthenticated = true;

      if (!user.malAuthenticated) {
        return res.status(200).json({ message: 'Login successful. Redirecting to connect MyAnimeList.', redirectTo: '/auth/login' });
      } else {
        req.session.malAuthenticated = true;
        req.session.malUsername = user.malUsername || null;
        return res.status(200).json({ message: 'Login successful. Redirecting to dashboard.', redirectTo: '/dashboard' });
      }
    } else {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

  } catch (error) {
    console.error('Error during local login:', error);
    return res.status(500).json({ message: 'Error during login.' });
  }
};

const callback = async (req, res) => {
  const { code, state } = req.query;

  console.log('=== Debug Callback Information ===');
  console.log('Session ID:', req.sessionID);
  console.log('Time Since Auth Start:', Date.now() - (req.session.authStartTime || 0));
  console.log('==============================');

  if (req.session.callbackProcessed) {
    console.error('Duplicate callback request detected');
    return res.status(400).send('Authentication Error: Duplicate Request');
  }

  if (!req.session.state || state !== req.session.state) {
    console.error('State validation failed');
    return res.status(400).send('Authentication Error: Invalid State');
  }

  const codeVerifier = req.session.codeVerifier;

  if (!codeVerifier) {
    console.error('No code verifier found in session during callback');
    return res.status(400).send('Authentication Error: Session Expired (No Code Verifier)');
  }

  if (req.session.codeUsed) {
    console.error('Code has already been used');
    return res.status(400).send('Authentication Error: Code Already Used');
  }

  const codeAge = Date.now() - (req.session.authStartTime || 0);
  if (codeAge > 5 * 60 * 1000) {
    console.error('Code has expired');
    return res.status(400).send('Authentication Error: Code Expired');
  }

  try {
    req.session.callbackProcessed = true;
    await new Promise((resolve) => req.session.save(resolve));

    console.log('=== Token Exchange Request ===');
    console.log('Redirect URI:', redirectUri);
    console.log('Client ID:', clientId);
    console.log('============================');

    req.session.codeUsed = true;
    await new Promise((resolve) => req.session.save(resolve));

    const formData = new URLSearchParams();
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);
    formData.append('grant_type', 'authorization_code');
    formData.append('code', code);
    formData.append('redirect_uri', redirectUri);
    formData.append('code_verifier', codeVerifier);

    console.log('Form data being sent (non-sensitive details only)');

    const tokenResponse = await axios.post(
      tokenUrl,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        validateStatus: (status) => status < 500,
      }
    );

    if (tokenResponse.data.error) {
      console.error('Token error response:', tokenResponse.data);
      if (tokenResponse.data.error === 'invalid_grant') {
        console.log('Detected invalid_grant error - likely code or verifier issue');
        req.session.destroy((err) => console.error('Error destroying session:', err));
        return res.status(400).send('Authentication Error: Invalid Grant (Likely Code Verifier Issue)');
      }
      return res.status(400).send(`Authentication Error: ${tokenResponse.data.error_description || tokenResponse.data.error}`);
    }

    console.log(' Access Token received');

    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token;
    const tokenExpiry = Date.now() + (tokenResponse.data.expires_in * 1000);

    // --- START: Fetch MyAnimeList User Info and Link to User ---
    try {
      const malUserResponse = await axios.get('https://api.myanimelist.net/v2/users/@me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const malUsername = malUserResponse.data.name;

      // Get the logged-in user's ID from the session (could be Google or local)
      const userId = req.session.userId;

      if (userId) {
        const user = await User.findById(userId);

        if (user) {
          user.malAccessToken = accessToken;
          user.malRefreshToken = refreshToken;
          user.malTokenExpiry = tokenExpiry;
          user.malUsername = malUsername;
          user.malAuthenticated = true;
          await user.save();

          req.session.malUsername = user.malUsername;
          req.session.malAuthenticated = true;

          await new Promise((resolve, reject) => {
            req.session.save((err) => {
              if (err) {
                console.error('Error saving session after MAL connect:', err);
                reject(err);
              } else {
                resolve();
              }
            });
          });

          return res.redirect('http://localhost:5173/dashboard');
        } else {
          console.error('User not found in database:', userId);
          return res.status(404).send('User not found.');
        }
      } else {
        console.error('No user ID found in session during MAL callback.');
        return res.status(401).send('Not authenticated.');
      }

    } catch (malApiError) {
      console.error('Error fetching MyAnimeList user info:', malApiError.response?.data || malApiError.message);
      return res.status(500).send('Authentication Error: Could not fetch MyAnimeList user data.');
    }
    // --- END: Fetch MyAnimeList User Info and Link to User ---

  } catch (error) {
    console.error(' Error exchanging code for token:', error.response?.data || error.message);
    req.session.destroy((err) => console.error('Error destroying session:', err));
    return;
  } finally {
    // --- Session Cleanup ---
    delete req.session.state;
    delete req.session.codeVerifier;
    delete req.session.codeUsed;
    delete req.session.callbackProcessed;

    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('Error saving session after cleanup:', saveErr);
        return res.status(500).send('Authentication Error: Error saving session');
      }

    });
  }
};

const login = async (req, res) => {
  try {
    const state = crypto.randomBytes(32).toString('hex');
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = codeVerifier; // Plain method

    // DO NOT REGENERATE SESSION HERE
    req.session.state = state;
    req.session.codeVerifier = codeVerifier;
    req.session.authStartTime = Date.now();
    req.session.codeUsed = false;
    req.session.callbackProcessed = false;

    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('Error saving session:', saveErr);
        return res.status(500).send('Error saving session before redirect');
      }

      const authUrl = new URL(authorizationUrl);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('client_id', clientId);
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('code_challenge_method', 'plain');
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('scope', 'profile email');

      console.log('=== Debug Login (Using PLAIN PKCE) ===');
      console.log('Session ID:', req.sessionID);

      console.log('Auth Start Time:', req.session.authStartTime);
      console.log('Constructed Auth URL:', authUrl.toString());
      console.log('======================================');


      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
      res.redirect(authUrl.toString());
    });
  } catch (error) {
    console.error('Unexpected error in login route:', error);
    res.status(500).send('An unexpected error occurred. Please try again.');
  }
};

module.exports = { login, callback, localSignup, localLogin };