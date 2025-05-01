
const crypto = require('crypto');

function generateCodeVerifier() {
  const length = Math.floor(Math.random() * (128 - 43 + 1)) + 43;
  return crypto.randomBytes(length)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .slice(0, length);
}


function generateCodeChallenge(codeVerifier) {
  return crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

module.exports = { generateCodeVerifier, generateCodeChallenge };