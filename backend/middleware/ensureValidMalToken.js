// const User = require('../models/User');
// const { refreshMalToken } = require('../controllers/authController');

// const ensureValidMalToken = async (req, res, next) => {
//   try {
//     const userId = req.session.userId;
//     if (!userId) {
//       return res.status(401).json({ message: 'Unauthorized: No session' });
//     }

//     const user = await User.findById(userId);
//     if (!user || !user.malAuthenticated) {
//       return res.status(401).json({ message: 'MAL not connected' });
//     }

//     const tokenExpired = !user.malTokenExpiry || user.malTokenExpiry < Date.now();
//     if (tokenExpired) {
//       console.log(`MAL token expired. Refreshing for user: ${user.username}`);
//       await refreshMalToken(user);
//     }

//     next();
//   } catch (err) {
//     console.error('Error in ensureValidMalToken middleware:', err);
//     return res.status(500).json({ message: 'Error validating MAL token' });
//   }
// };

// module.exports = ensureValidMalToken;


const { refreshMalToken } = require('../controllers/authController');

const ensureValidMalToken = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user || !user.malAuthenticated) {
      return res.status(401).json({ message: 'MAL not connected' });
    }

    const tokenExpired = !user.malTokenExpiry || user.malTokenExpiry < Date.now();
    if (tokenExpired) {
      console.log(`🔁 MAL token expired. Refreshing for user: ${user.username}`);
      try {
        await refreshMalToken(user);
      } catch (err) {
        return res.status(401).json({ message: 'Session expired. Please log in again.' });
      }
    }

    next();
  } catch (err) {
    console.error('Error in ensureValidMalToken middleware:', err);
    return res.status(500).json({ message: 'Error validating MAL token' });
  }
};

module.exports = ensureValidMalToken;
