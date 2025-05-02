



module.exports = {
  clientId: process.env.MAL_CLIENT_ID,
  clientSecret: process.env.MAL_CLIENT_SECRET,
  redirectUri: process.env.MAL_REDIRECT_URI,
  authorizationUrl: 'https://myanimelist.net/v1/oauth2/authorize', 
  tokenUrl: 'https://myanimelist.net/v1/oauth2/token', 
};