const axios = require('axios');
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

const fetchAnimeList = async (req, res) => {
  try {
    // Assuming the access token is stored in the session after successful login
    const accessToken = req.session.malAccessToken;

    if (!accessToken) {
      return res.status(401).json({ message: 'Not authenticated or MyAnimeList not linked.' });
    }

    const apiUrl = 'https://api.myanimelist.net/v2/users/@me/animelist';
    const params = {
      fields: 'list_status(num_episodes_watched,status),anime(title,main_picture)', // Adjust fields as needed
      limit: 100, // Adjust limit as needed (max 1000 per page)
      // Add other parameters like status (watching, completed, etc.) if desired
    };

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: params,
    });

    res.status(200).json(response.data);

  } catch (error) {
    console.error('Error fetching anime list:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      return res.status(401).json({ message: 'Invalid or expired MyAnimeList access token.' });
    }
    res.status(500).json({ message: 'Failed to fetch anime list from MyAnimeList.' });
  }
};

module.exports = { getCurrentUser, fetchAnimeList };