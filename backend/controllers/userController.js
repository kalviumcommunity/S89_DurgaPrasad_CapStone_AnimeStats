const User = require('../models/User');

const getCurrentUser = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(req.session.userId).select('malId malUsername');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      userId: user._id,
      malId: user.malId,
      malUsername: user.malUsername,
      isMalLinked: !!user.malId
    });

  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
};

module.exports = { getCurrentUser };