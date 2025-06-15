
// // authController.js
// const crypto = require('crypto');
// const axios = require('axios');
// const bcrypt = require('bcrypt');
// const { clientId, clientSecret, redirectUri, authorizationUrl, tokenUrl } = require('../config/myAnimeListOAuth.js');
// const { generateCodeVerifier } = require('../utils/authUtils');
// const User = require("../models/User.js");

// const saltRounds = 10;

// const localSignup = async (req, res) => {
//   const { username, email, password } = req.body;
//   if (!username || !email || !password) {
//     return res.status(400).json({ message: 'Please provide username, email, and password.' });
//   }

//   try {
//     const existingUser = await User.findOne({ $or: [{ username }, { email }] });
//     if (existingUser) {
//       return res.status(409).json({ message: 'Username or email already exists.' });
//     }

//     const hashedPassword = await bcrypt.hash(password, saltRounds);
//     const newUser = new User({ username, email, password: hashedPassword });
//     const savedUser = await newUser.save();

//     req.session.userId = savedUser._id;
//     req.session.isAuthenticated = true;
//     req.session.save((err) => {
//       if (err) {
//         console.error('Error saving session after signup:', err);
//         return res.status(500).json({ message: 'Error saving session.' });
//       }
//       return res.status(201).json({
//         message: 'Signup successful. Redirecting...',
//         user: { _id: savedUser._id, username: savedUser.username, email: savedUser.email }
//       });
//     });

//   } catch (error) {
//     console.error('Error during local signup:', error);
//     return res.status(500).json({ message: 'Error creating user.' });
//   }
// };

// const localLogin = async (req, res) => {
//   const { identifier, password } = req.body;
//   if (!identifier || !password) {
//     return res.status(400).json({ message: 'Please provide username/email and password.' });
//   }

//   try {
//     const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
//     if (!user || !user.password) {
//       return res.status(401).json({ message: 'Invalid credentials.' });
//     }

//     const passwordMatch = await bcrypt.compare(password, user.password);
//     if (!passwordMatch) {
//       return res.status(401).json({ message: 'Invalid credentials.' });
//     }

//     req.session.userId = user._id;
//     req.session.isAuthenticated = true;

//     if (!user.malAuthenticated) {
//       return res.status(200).json({ message: 'Login successful. Redirecting to connect MyAnimeList.', redirectTo: '/auth/login' });
//     } else {
//       req.session.malAuthenticated = true;
//       req.session.malUsername = user.malUsername || null;
//       return res.status(200).json({ message: 'Login successful. Redirecting to dashboard.', redirectTo: '/dashboard' });
//     }

//   } catch (error) {
//     console.error('Error during local login:', error);
//     return res.status(500).json({ message: 'Error during login.' });
//   }
// };

// const refreshMalToken = async (user) => {
//   const formData = new URLSearchParams();
//   formData.append('grant_type', 'refresh_token');
//   formData.append('refresh_token', user.malRefreshToken);
//   formData.append('client_id', clientId);
//   formData.append('client_secret', clientSecret);

//   const response = await axios.post(tokenUrl, formData, {
//     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//   });

//   user.malAccessToken = response.data.access_token;
//   user.malRefreshToken = response.data.refresh_token;
//   user.malTokenExpiry = Date.now() + response.data.expires_in * 1000;
//   await user.save();
//   return user.malAccessToken;
// };

// const callback = async (req, res) => {
//   const { code, state } = req.query;

//   if (req.session.callbackProcessed) {
//     return res.status(400).send('Authentication Error: Duplicate Request');
//   }
//   if (!req.session.state || state !== req.session.state) {
//     return res.status(400).send('Authentication Error: Invalid State');
//   }

//   const codeVerifier = req.session.codeVerifier;
//   if (!codeVerifier) {
//     return res.status(400).send('Authentication Error: Session Expired (No Code Verifier)');
//   }
//   if (req.session.codeUsed) {
//     return res.status(400).send('Authentication Error: Code Already Used');
//   }

//   const codeAge = Date.now() - (req.session.authStartTime || 0);
//   if (codeAge > 5 * 60 * 1000) {
//     return res.status(400).send('Authentication Error: Code Expired');
//   }

//   try {
//     req.session.callbackProcessed = true;
//     req.session.codeUsed = true;
//     await new Promise((resolve) => req.session.save(resolve));

//     const formData = new URLSearchParams();
//     formData.append('client_id', clientId);
//     formData.append('client_secret', clientSecret);
//     formData.append('grant_type', 'authorization_code');
//     formData.append('code', code);
//     formData.append('redirect_uri', redirectUri);
//     formData.append('code_verifier', codeVerifier);

//     const tokenResponse = await axios.post(tokenUrl, formData, {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         'Accept': 'application/json'
//       },
//       validateStatus: (status) => status < 500,
//     });

//     if (tokenResponse.data.error) {
//       req.session.destroy(() => {});
//       return res.status(400).send(`Authentication Error: ${tokenResponse.data.error_description || tokenResponse.data.error}`);
//     }

//     const accessToken = tokenResponse.data.access_token;
//     const refreshToken = tokenResponse.data.refresh_token;
//     const tokenExpiry = Date.now() + (tokenResponse.data.expires_in * 1000);

//     const malUserResponse = await axios.get('https://api.myanimelist.net/v2/users/@me', {
//       headers: { Authorization: `Bearer ${accessToken}` },
//     });

//     const malUsername = malUserResponse.data.name;
//     const userId = req.session.userId;

//     if (!userId) {
//       return res.status(401).send('Not authenticated.');
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).send('User not found.');
//     }

//     // Save MAL data to DB
//     user.malAccessToken = accessToken;
//     user.malRefreshToken = refreshToken;
//     user.malTokenExpiry = tokenExpiry;
//     user.malUsername = malUsername;
//     user.malAuthenticated = true;
//     await user.save();

//     // Save session MAL flags
//     req.session.malUsername = user.malUsername;
//     req.session.malAuthenticated = true;

//     await new Promise((resolve, reject) => {
//       req.session.save((err) => err ? reject(err) : resolve());
//     });

//     return res.redirect('http://localhost:5173/dashboard');

//   } catch (error) {
//     console.error('Error exchanging code for token:', error.response?.data || error.message);
//     req.session.destroy(() => {});
//     return res.status(500).send('Authentication error occurred.');
//   } finally {
//     delete req.session.state;
//     delete req.session.codeVerifier;
//     delete req.session.codeUsed;
//     delete req.session.callbackProcessed;
//     req.session.save(() => {});
//   }
// };

// const login = async (req, res) => {
//   try {
//     const state = crypto.randomBytes(32).toString('hex');
//     const codeVerifier = generateCodeVerifier();
//     const codeChallenge = codeVerifier;

//     req.session.state = state;
//     req.session.codeVerifier = codeVerifier;
//     req.session.authStartTime = Date.now();
//     req.session.codeUsed = false;
//     req.session.callbackProcessed = false;

//     req.session.save((saveErr) => {
//       if (saveErr) {
//         return res.status(500).send('Error saving session before redirect');
//       }

//       const authUrl = new URL(authorizationUrl);
//       authUrl.searchParams.append('response_type', 'code');
//       authUrl.searchParams.append('client_id', clientId);
//       authUrl.searchParams.append('state', state);
//       authUrl.searchParams.append('code_challenge', codeChallenge);
//       authUrl.searchParams.append('code_challenge_method', 'plain');
//       authUrl.searchParams.append('redirect_uri', redirectUri);
//       authUrl.searchParams.append('scope', 'profile email');

//       res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
//       res.redirect(authUrl.toString());
//     });
//   } catch (error) {
//     res.status(500).send('An unexpected error occurred. Please try again.');
//   }
// };

// module.exports = {
//   login,
//   callback,
//   localSignup,
//   localLogin,
//   refreshMalToken
// };

const axios = require('axios');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// =============== LOCAL SIGNUP ================
const signup = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Provide all details' });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'Signup successful', user });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// =============== LOCAL LOGIN ================
const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Provide all details' });

  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    req.session.userId = user._id;
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// =============== MAL OAUTH LOGIN ================
const malLogin = async (req, res) => {
  if (!req.session.userId) return res.redirect('/api/auth/login');

  const state = crypto.randomBytes(32).toString('hex');
  const codeVerifier = crypto.randomBytes(64).toString('base64url');

  req.session.state = state;
  req.session.codeVerifier = codeVerifier;
  req.session.authStartTime = Date.now();
  req.session.codeUsed = false;
  req.session.callbackProcessed = false;

  const redirectUri = process.env.MAL_REDIRECT_URI;

  const url = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${process.env.MAL_CLIENT_ID}&state=${state}&code_challenge=${codeVerifier}&code_challenge_method=plain&redirect_uri=${redirectUri}`;

  res.redirect(url);
};

// =============== MAL OAUTH CALLBACK ================
const malCallback = async (req, res) => {
  const { code, state } = req.query;
  const session = req.session;

  if (!session || !session.userId || session.codeUsed || session.callbackProcessed) {
    return res.status(400).send('Session expired or already used.');
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
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, token_type, expires_in } = tokenResponse.data;

    const userResponse = await axios.get('https://api.myanimelist.net/v2/users/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const malData = userResponse.data;

   await User.findByIdAndUpdate(session.userId, {
  mal: {
    username: malData.name,
    accessToken: access_token,
    refreshToken: refresh_token,
    tokenType: token_type,
    expiresIn: expires_in,
    lastSynced: new Date(),
  },
  malAuthenticated: true,
});
    console.log("✅ Updated user MAL details:", await User.findById(session.userId));

    session.codeUsed = true;
    session.callbackProcessed = true;

    res.redirect(`${process.env.FRONTEND_URL}/home`);
  } catch (error) {
    console.error('❌ MAL OAuth error:', error.response?.data || error.message);
    res.status(500).send('Failed to authenticate with MyAnimeList.');
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
};
