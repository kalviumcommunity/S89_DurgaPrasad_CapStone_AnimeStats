// server/middleware/isAuthenticated.js
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    // User is authenticated, proceed to the next middleware or route handler
    return next();
  } else {
    // User is not authenticated, send an error response
    return res.status(401).json({ message: 'Not authenticated' });
  }
};

module.exports = isAuthenticated;