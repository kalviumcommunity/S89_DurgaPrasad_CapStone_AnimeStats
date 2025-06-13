

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const statusCounts = {
      completed: 0,
      watching: 0,
      plan_to_watch: 0,
      dropped: 0,
      on_hold: 0,
    };

    let totalEpisodes = 0;
    const genreCount = {};
    const studioCount = {};

    user.watchlist.forEach(anime => {
      const status = anime.status || 'plan_to_watch';
      statusCounts[status]++;

      totalEpisodes += anime.totalEpisodes || 0;

      console.log(`Anime Title: ${anime.title}`);
      console.log('Genres:', anime.genres);
      console.log('Studios:', anime.studios);

      if (Array.isArray(anime.genres)) {
        anime.genres.forEach(genre => {
          const name = genre.name?.toLowerCase();
          if (name) {
            genreCount[name] = (genreCount[name] || 0) + 1;
          }
        });
      }

      if (Array.isArray(anime.studios)) {
        anime.studios.forEach(studio => {
          const name = studio.name?.toLowerCase();
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
      totalEpisodes,
      topGenres,
      topStudios,
    });
  } catch (error) {
    console.error('Error generating stats:', error);
    res.status(500).json({ message: 'Failed to generate statistics' });
  }
});

module.exports = router;
