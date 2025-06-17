const express = require('express');
const router = express.Router();
const User = require('../models/User');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    if (!user || !user.watchlist || user.watchlist.length === 0) {
      return res.status(200).json({
        statusCounts: {},
        topGenres: [],
        topStudios: [],
        totalEpisodesWatched: 0,
      });
    }

    const { watchlist } = user;

    const totalEpisodesWatched = watchlist
      .filter(item => item.status === 'completed')
      .reduce((sum, item) => sum + (item.totalEpisodes || 0), 0);

    const statusCounts = {};
    const genreCount = {};
    const studioCount = {};

    watchlist.forEach(anime => {
      const status = anime.status || 'plan_to_watch';
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      if (Array.isArray(anime.genres)) {
        anime.genres.forEach(genre => {
          const name = genre.name;
          if (name) {
            genreCount[name] = (genreCount[name] || 0) + 1;
          }
        });
      }

      if (Array.isArray(anime.studios)) {
        anime.studios.forEach(studio => {
          const name = studio.name;
          if (name) {
            studioCount[name] = (studioCount[name] || 0) + 1;
          }
        });
      }
    });

    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const topStudios = Object.entries(studioCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      statusCounts,
      topGenres,
      topStudios,
      totalEpisodesWatched,
    });
    
  } catch (error) {
    console.error('Error generating stats:', error);
    res.status(500).json({ message: 'Failed to generate statistics' });
  }
});

module.exports = router;
