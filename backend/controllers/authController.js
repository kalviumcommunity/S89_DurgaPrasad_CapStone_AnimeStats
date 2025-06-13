
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


const crypto = require('crypto');
const axios = require('axios');
const bcrypt = require('bcrypt');
const {
  clientId,
  clientSecret,
  redirectUri,
  authorizationUrl,
  tokenUrl
} = require('../config/myAnimeListOAuth.js');
const { generateCodeVerifier } = require('../utils/authUtils');
const User = require('../models/User.js');

const saltRounds = 10;

// Local Signup
const localSignup = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide username, email, and password.' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ username, email, password: hashedPassword });
    const savedUser = await newUser.save();

    req.session.userId = savedUser._id;
    req.session.isAuthenticated = true;

    req.session.save((err) => {
      if (err) {
        console.error('Session save error after signup:', err);
        return res.status(500).json({ message: 'Error saving session.' });
      }
      res.status(201).json({
        message: 'Signup successful. Redirecting...',
        user: {
          _id: savedUser._id,
          username: savedUser.username,
          email: savedUser.email
        }
      });
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user.' });
  }
};

// Local Login
const localLogin = async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Please provide username/email and password.' });
  }

  try {
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    req.session.userId = user._id;
    req.session.isAuthenticated = true;
    req.session.malAuthenticated = user.malAuthenticated || false;
    req.session.malUsername = user.malUsername || null;

    const redirectTo = user.malAuthenticated ? '/dashboard' : '/auth/login';

    req.session.save((err) => {
      if (err) {
        console.error('Error saving session during login:', err);
        return res.status(500).json({ message: 'Login session error.' });
      }

      res.status(200).json({
        message: 'Login successful.',
        redirectTo
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login.' });
  }
};

// Refresh MAL token
const refreshMalToken = async (user) => {
  const formData = new URLSearchParams();
  formData.append('grant_type', 'refresh_token');
  formData.append('refresh_token', user.malRefreshToken);
  formData.append('client_id', clientId);
  formData.append('client_secret', clientSecret);

  const response = await axios.post(tokenUrl, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  user.malAccessToken = response.data.access_token;
  user.malRefreshToken = response.data.refresh_token;
  user.malTokenExpiry = Date.now() + response.data.expires_in * 1000;
  await user.save();

  return user.malAccessToken;
};

// MAL OAuth Login Initiation
const login = async (req, res) => {
  try {
    const state = crypto.randomBytes(32).toString('hex');
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = codeVerifier;

    req.session.state = state;
    req.session.codeVerifier = codeVerifier;
    req.session.authStartTime = Date.now();
    req.session.codeUsed = false;
    req.session.callbackProcessed = false;

    req.session.save((err) => {
      if (err) return res.status(500).send('Error saving session before redirect');

      const authUrl = new URL(authorizationUrl);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('client_id', clientId);
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('code_challenge_method', 'plain');
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('scope', 'profile email');

      res.redirect(authUrl.toString());
    });
  } catch (error) {
    console.error('OAuth login error:', error);
    res.status(500).send('Unexpected error during MyAnimeList login.');
  }
};

// MAL OAuth Callback
const callback = async (req, res) => {
  const { code, state } = req.query;

  // Validation checks
  if (req.session.callbackProcessed || !req.session.state || state !== req.session.state) {
    return res.status(400).send('Authentication Error: Invalid or Duplicate Request');
  }
  if (!req.session.codeVerifier) {
    return res.status(400).send('Session expired. Please try again.');
  }
  if (req.session.codeUsed) {
    return res.status(400).send('Authentication Error: Code already used.');
  }
  if ((Date.now() - (req.session.authStartTime || 0)) > 5 * 60 * 1000) {
    return res.status(400).send('Authentication Error: Code expired.');
  }

  try {
    req.session.codeUsed = true;
    req.session.callbackProcessed = true;
    await new Promise((resolve) => req.session.save(resolve));

    // Exchange code for tokens
    const formData = new URLSearchParams();
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);
    formData.append('grant_type', 'authorization_code');
    formData.append('code', code);
    formData.append('redirect_uri', redirectUri);
    formData.append('code_verifier', req.session.codeVerifier);

    const tokenResponse = await axios.post(tokenUrl, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (tokenResponse.data.error) {
      req.session.destroy(() => {});
      return res.status(400).send(`Authentication Error: ${tokenResponse.data.error_description}`);
    }

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    const tokenExpiry = Date.now() + expires_in * 1000;

    const malUser = await axios.get('https://api.myanimelist.net/v2/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).send('User not found.');

    // Update user with MAL data
    user.malAccessToken = access_token;
    user.malRefreshToken = refresh_token;
    user.malTokenExpiry = tokenExpiry;
    user.malUsername = malUser.data.name;
    user.malAuthenticated = true;
    await user.save();

    // Update session
    req.session.malAuthenticated = true;
    req.session.malUsername = user.malUsername;

    await new Promise((resolve) => req.session.save(resolve));

    res.redirect('http://localhost:5173/dashboard');
  } catch (error) {
    console.error('Callback error:', error.response?.data || error.message);
    req.session.destroy(() => {});
    res.status(500).send('Authentication error occurred.');
  } finally {
    delete req.session.state;
    delete req.session.codeVerifier;
    delete req.session.codeUsed;
    delete req.session.callbackProcessed;
    req.session.save(() => {});
  }
};

module.exports = {
  login,
  callback,
  localSignup,
  localLogin,
  refreshMalToken
};

