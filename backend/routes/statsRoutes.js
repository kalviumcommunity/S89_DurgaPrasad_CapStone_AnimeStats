

// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const isAuthenticated = require('../middleware/isAuthenticated');

// router.use(isAuthenticated);

// // GET /api/stats
// router.get('/', async (req, res) => {
//   try {
//     const user = await User.findById(req.session.userId);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const statusCounts = {
//       completed: 0,
//       watching: 0,
//       plan_to_watch: 0,
//       dropped: 0,
//       on_hold: 0,
//     };

//     let totalEpisodes = 0;
//     const genreCount = {};
//     const studioCount = {};

//     user.watchlist.forEach(anime => {
//       const status = anime.status || 'plan_to_watch';
//       statusCounts[status]++;

//       totalEpisodes += anime.totalEpisodes || 0;

//       console.log(`Anime Title: ${anime.title}`);
//       console.log('Genres:', anime.genres);
//       console.log('Studios:', anime.studios);

//       if (Array.isArray(anime.genres)) {
//         anime.genres.forEach(genre => {
//           const name = genre.name?.toLowerCase();
//           if (name) {
//             genreCount[name] = (genreCount[name] || 0) + 1;
//           }
//         });
//       }

//       if (Array.isArray(anime.studios)) {
//         anime.studios.forEach(studio => {
//           const name = studio.name?.toLowerCase();
//           if (name) {
//             studioCount[name] = (studioCount[name] || 0) + 1;
//           }
//         });
//       }
//     });

//     const topGenres = Object.entries(genreCount)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 5)
//       .map(([name, count]) => ({ name, count }));

//     const topStudios = Object.entries(studioCount)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 5)
//       .map(([name, count]) => ({ name, count }));

//     res.json({
//       statusCounts,
//       totalEpisodes,
//       topGenres,
//       topStudios,
//     });
//   } catch (error) {
//     console.error('Error generating stats:', error);
//     res.status(500).json({ message: 'Failed to generate statistics' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const User = require('../models/User');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean(); // Using .lean() is good practice here
    if (!user || !user.watchlist || user.watchlist.length === 0) {
      // Send a default object if there's no data
      return res.status(200).json({
        statusCounts: {},
        topGenres: [],
        topStudios: [],
        totalEpisodesWatched: 0,
      });
    }

    const { watchlist } = user; // Destructure for cleaner access

    // --- THIS IS THE DIAGNOSTIC LOG ---
    // This will print the exact data from your database to your backend terminal.
    // It helps us see if the 'status' and 'totalEpisodes' fields are correct.
    console.log("📊 DATA FOR STATS CALCULATION:", JSON.stringify(watchlist, null, 2));


    // --- The Calculation ---
    const totalEpisodesWatched = watchlist
      .filter(item => item.status === 'completed') // This filter is case-sensitive and needs an exact match.
      .reduce((sum, item) => sum + (item.totalEpisodes || 0), 0); // This sums up the episodes.

    
    // --- Your existing calculations for other stats ---
    const statusCounts = {};
    const genreCount = {};
    const studioCount = {};

    watchlist.forEach(anime => {
      // Status Count
      const status = anime.status || 'plan_to_watch';
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      // Genre Count
      if (Array.isArray(anime.genres)) {
        anime.genres.forEach(genre => {
          const name = genre.name;
          if (name) {
            genreCount[name] = (genreCount[name] || 0) + 1;
          }
        });
      }

      // Studio Count
      if (Array.isArray(anime.studios)) {
        anime.studios.forEach(studio => {
          const name = studio.name;
          if (name) {
            // A small fix was needed here: studioCount[name] instead of studioCount[name]
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

    // --- UPDATED RESPONSE OBJECT ---
    res.json({
      statusCounts,
      topGenres,
      topStudios,
      totalEpisodesWatched, // Send the new, correct value
    });
    
  } catch (error) {
    console.error('Error generating stats:', error);
    res.status(500).json({ message: 'Failed to generate statistics' });
  }
});

module.exports = router;