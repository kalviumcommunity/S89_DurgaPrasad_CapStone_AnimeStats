
const crypto = require('crypto');
const axios = require('axios');
const { clientId, clientSecret, redirectUri, authorizationUrl, tokenUrl } = require('../config/myAnimeListOAuth.js');
const { generateCodeVerifier } = require('../utils/authUtils');
const User = require("../models/User.js");

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

    console.log('✅ Access Token received');

    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token;
    const tokenExpiry = Date.now() + (tokenResponse.data.expires_in * 1000);

    // --- START: Fetch MyAnimeList User Info and Link to Google User ---
    try {
      const malUserResponse = await axios.get('https://api.myanimelist.net/v2/users/@me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const malUsername = malUserResponse.data.name;

      // Get the logged-in Google user's ID from the session
      const googleUserId = req.session.userId;

      if (googleUserId) {
        const user = await User.findById(googleUserId);

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

          return res.redirect('http://localhost:5173/dashboard'); // Redirect to dashboard
        } else {
          console.error('Google user not found in database:', googleUserId);
          return res.status(404).send('Google user not found.');
        }
      } else {
        console.error('No Google user ID found in session during MAL callback.');
        return res.status(401).send('Not authenticated with Google.');
      }

    } catch (malApiError) {
      console.error('Error fetching MyAnimeList user info:', malApiError.response?.data || malApiError.message);
      return res.status(500).send('Authentication Error: Could not fetch MyAnimeList user data.');
    }
    // --- END: Fetch MyAnimeList User Info and Link to Google User ---

  } catch (error) {
    console.error('❌ Error exchanging code for token:', error.response?.data || error.message);
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
      // No need to res.send here as res.redirect or res.status has likely been called
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
      authUrl.searchParams.append('scope', 'profile email'); // Added scope here

      console.log('=== Debug Login (Using PLAIN PKCE) ===');
      console.log('Session ID:', req.sessionID);
      // Removed logging of state, codeVerifier, and codeChallenge
      console.log('Auth Start Time:', req.session.authStartTime);
      console.log('Constructed Auth URL:', authUrl.toString()); // Added logging of the constructed URL
      console.log('======================================');

      // Manually set the Access-Control-Allow-Origin header
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
      res.redirect(authUrl.toString());
    });
  } catch (error) {
    console.error('Unexpected error in login route:', error);
    res.status(500).send('An unexpected error occurred. Please try again.');
  }
};

module.exports = { login, callback };