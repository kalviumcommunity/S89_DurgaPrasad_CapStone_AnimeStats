// server/controllers/watchlistController.js
const User = require('../models/User'); // Assuming your User model is in '../models'

exports.getUserWatchlist = async (req, res) => {
  try {
    // req.session.userId is available because of the isAuthenticated middleware
    const userId = req.session.userId;

    const user = await User.findById(userId).select('watchlist');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.watchlist);

  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ message: 'Failed to fetch watchlist' });
  }
};

exports.addAnimeToWatchlist = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { animeId, status } = req.body; // Expecting animeId and status in the request body

    if (!animeId || !status) {
      return res.status(400).json({ message: 'Missing required fields: animeId and status' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the anime is already in the watchlist
    const alreadyExists = user.watchlist.some(entry => entry.animeId === animeId);

    if (alreadyExists) {
      return res.status(409).json({ message: 'Anime already in watchlist' });
    }

    const newWatchlistItem = {
      animeId: parseInt(animeId), // Ensure animeId is a number
      status,
      rating: 0, // You can set default values here
      progress: 0,
      totalEpisodes: 0, // You might want to fetch this from MAL in the future
      start_date: null,
      finish_date: null,
      is_rewatching: false,
      rewatch_count: 0,
      notes: '',
    };

    user.watchlist.push(newWatchlistItem);
    await user.save();

    res.status(201).json({ message: 'Anime added to watchlist', item: newWatchlistItem });

  } catch (error) {
    console.error('Error adding anime to watchlist:', error);
    res.status(500).json({ message: 'Failed to add anime to watchlist' });
  }
};

exports.updateAnimeInWatchlist = async (req, res) => {
  try {
    const userId = req.session.userId;
    const animeId = parseInt(req.params.animeId); // Get animeId from the URL parameter
    const updates = req.body; // Expecting updated fields in the request body

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const watchlistEntry = user.watchlist.find(entry => entry.animeId === animeId);

    if (!watchlistEntry) {
      return res.status(404).json({ message: 'Anime not found in watchlist' });
    }

    // Update the fields from the request body
    for (const key in updates) {
      if (watchlistEntry.hasOwnProperty(key) && key !== 'animeId') {
        watchlistEntry[key] = updates[key];
      }
    }

    await user.save();

    res.status(200).json({ message: 'Watchlist updated successfully' });

  } catch (error) {
    console.error('Error updating anime in watchlist:', error);
    res.status(500).json({ message: 'Failed to update watchlist' });
  }
};

exports.removeAnimeFromWatchlist = async (req, res) => {
  try {
    const userId = req.session.userId;
    const animeId = parseInt(req.params.animeId); // Get animeId from the URL parameter

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const initialLength = user.watchlist.length;
    user.watchlist = user.watchlist.filter(entry => entry.animeId !== animeId);

    if (user.watchlist.length === initialLength) {
      return res.status(404).json({ message: 'Anime not found in watchlist' });
    }

    await user.save();

    res.status(200).json({ message: 'Anime removed from watchlist' });

  } catch (error) {
    console.error('Error removing anime from watchlist:', error);
    res.status(500).json({ message: 'Failed to remove anime from watchlist' });
  }
};