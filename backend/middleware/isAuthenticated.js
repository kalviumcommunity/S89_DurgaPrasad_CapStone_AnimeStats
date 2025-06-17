const User = require('../models/User');

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      req.user = user;
      return next();
    } else {
      return res.status(401).json({ message: 'Not authenticated' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Authentication check failed' });
  }
};

module.exports = isAuthenticated;
