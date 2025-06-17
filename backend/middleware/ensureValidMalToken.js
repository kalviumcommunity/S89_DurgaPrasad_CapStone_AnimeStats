
// const { refreshMalToken } = require('../controllers/authController');

// const ensureValidMalToken = async (req, res, next) => {
//   try {
//     const user = req.user;

//     if (!user) {
//       console.log("❌ No user found on request object");
//       return res.status(401).json({ message: 'Unauthorized: No user' });
//     }

//     // Log basic info
//     console.log("👤 User in ensureValidMalToken:", user.googleName || user.username || 'Unknown');
//     console.log("🧾 Full user object:", {
//       id: user._id,
//       username: user.username,
//       malAuthenticated: user.malAuthenticated,
//       mal: user.mal, // Token info
//     });

//     if (!user.malAuthenticated) {
//       console.log("❌ MAL account not connected for this user");
//       return res.status(401).json({ message: 'MAL not connected' });
//     }

//     const now = Date.now();
//     const tokenExpired = !user.mal?.accessToken || user.mal.expiresAt < now;

//     if (tokenExpired) {
//       console.log("🔁 MAL token expired or missing. Attempting refresh...");

//       try {
//         await refreshMalToken(user);
//         console.log("✅ MAL token refreshed successfully");
//       } catch (err) {
//         console.error("❌ Failed to refresh MAL token:", err.message || err);
//         return res.status(401).json({ message: 'Session expired. Please log in again.' });
//       }
//     } else {
//       console.log("✅ MAL token is still valid");
//     }

//     next();
//   } catch (err) {
//     console.error('❌ Error in ensureValidMalToken middleware:', err.message || err);
//     return res.status(500).json({ message: 'Internal error validating MAL token' });
//   }
// };

// module.exports = ensureValidMalToken;

const { refreshMalToken } = require('../controllers/authController');

const ensureValidMalToken = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: No user' });
    }

    if (!user.malAuthenticated) {
      return res.status(401).json({ message: 'MAL not connected' });
    }

    const now = Date.now();
    const tokenExpired = !user.mal?.accessToken || user.mal.expiresAt < now;

    if (tokenExpired) {
      try {
        await refreshMalToken(user);
      } catch (err) {
        return res.status(401).json({ message: 'Session expired. Please log in again.' });
      }
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: 'Internal error validating MAL token' });
  }
};

module.exports = ensureValidMalToken;

