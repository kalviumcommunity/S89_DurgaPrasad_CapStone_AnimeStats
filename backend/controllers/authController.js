// controllers/authController.js
const crypto = require('crypto');
const axios = require('axios');
const { clientId, clientSecret, redirectUri, authorizationUrl, tokenUrl } = require('../config/myAnimeListOAuth');
const { generateCodeVerifier } = require('../utils/authUtils');


const login = async (req, res) => {
  try {
    const state = crypto.randomBytes(32).toString('hex');
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = codeVerifier; // Plain method

    req.session.regenerate((err) => {
      if (err) {
        console.error('Error regenerating session:', err);
        return res.status(500).send('Error initializing authentication');
      }

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

        console.log('=== Debug Login (Using PLAIN PKCE) ===');
        console.log('Session ID:', req.sessionID);
        console.log('State:', state);
        console.log('Code Verifier:', codeVerifier);
        console.log('Code Challenge (PLAIN):', codeChallenge);
        console.log('Auth Start Time:', req.session.authStartTime);
        console.log('======================================');

        res.redirect(authUrl.toString());
      });
    });
  } catch (error) {
    console.error('Unexpected error in login route:', error);
    res.status(500).send('An unexpected error occurred. Please try again.');
  }
};

const callback = async (req, res) => {
  const { code, state } = req.query;

  console.log('=== Debug Callback Information ===');
  console.log('Session ID:', req.sessionID);
  console.log('Query State:', state);
  console.log('Session State:', req.session.state);
  console.log('Session Code Verifier:', req.session.codeVerifier);
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
    console.log('Code:', code);
    console.log('Code Verifier (from session):', codeVerifier);
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

    console.log('Form data being sent:', formData.toString());

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
      console.error('❌ Token error response:', tokenResponse.data);
      if (tokenResponse.data.error === 'invalid_grant') {
        console.log('Detected invalid_grant error - likely code or verifier issue');
        req.session.destroy((err) => console.error('Error destroying session:', err));
        return res.status(400).send('Authentication Error: Invalid Grant (Likely Code Verifier Issue)');
      }
      return res.status(400).send(`Authentication Error: ${tokenResponse.data.error_description || tokenResponse.data.error}`);
    }

    console.log('✅ Access Token received');

    req.session.accessToken = tokenResponse.data.access_token;
    req.session.refreshToken = tokenResponse.data.refresh_token;
    req.session.tokenExpiry = Date.now() + (tokenResponse.data.expires_in * 1000);

    delete req.session.state;
    delete req.session.codeVerifier;
    delete req.session.codeUsed;
    delete req.session.callbackProcessed;

    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('Error saving session after token:', saveErr);
        return res.status(500).send('Authentication Error: Error saving session');
      }
      res.send('<h2>Authentication Successful! 🎉</h2><p>You can close this window.</p><script>if (window.opener) { window.opener.postMessage({ type: \'AUTH_SUCCESS\' }, \'*\'); }</script>');
    });
  } catch (error) {
    console.error('❌ Error exchanging code for token:', error.response?.data || error.message);
    req.session.destroy((err) => console.error('Error destroying session:', err));
    res.status(500).send('Authentication Error: Error during token exchange');
  }
};

module.exports = { login, callback };