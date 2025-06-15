
// // server/routes/watchlistRoutes.js
// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const axios = require('axios');
// const isAuthenticated = require('../middleware/isAuthenticated');

// router.use(isAuthenticated);

// // GET /api/user/watchlist
// router.get('/', async (req, res) => {
//   try {
//     const user = await User.findById(req.session.userId);
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     res.json(user.watchlist);
//   } catch (error) {
//     console.error('Fetch watchlist error:', error.message);
//     res.status(500).json({ message: 'Failed to fetch watchlist' });
//   }
// });

// // POST /api/user/watchlist
// router.post('/', async (req, res) => {
//   try {
//     const { animeId, status } = req.body;
//     const user = await User.findById(req.session.userId);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const existing = user.watchlist.find(entry => entry.animeId === animeId);
//     if (existing) return res.status(409).json({ message: 'Anime already in watchlist' });

//     const response = await axios.get(`https://api.myanimelist.net/v2/anime/${animeId}`, {
//       headers: {
//         Authorization: `Bearer ${user.malAccessToken}`,
//       },
//       params: {
//         fields: 'title,main_picture,genres,studios,num_episodes',
//       },
//     });

//     const anime = response.data;

//     // Debug: Print full MAL response to verify field paths
//     console.log("🎯 MAL Anime Response:", JSON.stringify(anime, null, 2));

//     const newEntry = {
//       animeId: anime.id,
//       title: anime.title || 'Unknown Title',
//       main_picture: anime.main_picture || {},
//      genres: Array.isArray(anime.genres) ? anime.genres.map(g => ({ id: g.id, name: g.name })) : [],
//      studios: Array.isArray(anime.studios) ? anime.studios.map(s => ({ id: s.id, name: s.name })) : [],
//       totalEpisodes: anime.num_episodes || 0,
//       status: status || 'plan_to_watch',
//       rating: null,
//       progress: 0,
//       is_rewatching: false,
//       rewatch_count: 0,
//       notes: '',
//     };

//     console.log("✅ New Watchlist Entry:", newEntry);

//     user.watchlist.push(newEntry);
//     await user.save();

//     res.status(201).json({ message: 'Anime added', watchlist: user.watchlist });
//   } catch (error) {
//     console.error('Add watchlist error:', error.response?.data || error.message);
//     res.status(500).json({ message: 'Error adding anime to watchlist' });
//   }
// });

// // PUT /api/user/watchlist/:animeId
// router.put('/:animeId', async (req, res) => {
//   try {
//     const { animeId } = req.params;
//     const updates = req.body;
//     const user = await User.findById(req.session.userId);

//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const anime = user.watchlist.find(entry => entry.animeId == animeId);
//     if (!anime) return res.status(404).json({ message: 'Anime not found in watchlist' });

//     Object.assign(anime, updates);
//     await user.save();

//     res.status(200).json({ message: 'Anime updated', watchlist: user.watchlist });
//   } catch (error) {
//     console.error('Update watchlist error:', error.message);
//     res.status(500).json({ message: 'Error updating anime in watchlist' });
//   }
// });

// // DELETE /api/user/watchlist/:animeId
// router.delete('/:animeId', async (req, res) => {
//   try {
//     const { animeId } = req.params;
//     const user = await User.findById(req.session.userId);

//     if (!user) return res.status(404).json({ message: 'User not found' });

//     user.watchlist = user.watchlist.filter(entry => entry.animeId != animeId);
//     await user.save();

//     res.status(200).json({ message: 'Anime removed', watchlist: user.watchlist });
//   } catch (error) {
//     console.error('Delete watchlist error:', error.message);
//     res.status(500).json({ message: 'Error removing anime from watchlist' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');
const isAuthenticated = require('../middleware/isAuthenticated');
const ensureValidMalToken = require('../middleware/ensureValidMalToken');

// 🔐 Apply isAuthenticated globally
router.use(isAuthenticated);

// ✅ GET /api/user/watchlist
router.get('/', async (req, res) => {
  try {
    const user = req.user; // req.user set by isAuthenticated
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.watchlist);
  } catch (error) {
    console.error('Fetch watchlist error:', error.message);
    res.status(500).json({ message: 'Failed to fetch watchlist' });
  }
});

// ✅ POST /api/user/watchlist (Needs MAL token)
router.post('/', ensureValidMalToken, async (req, res) => {
  try {
    const { animeId, status } = req.body;
    const user = req.user; // req.user set by isAuthenticated

    const existing = user.watchlist.find(entry => entry.animeId === animeId);
    if (existing) return res.status(409).json({ message: 'Anime already in watchlist' });

    const response = await axios.get(`https://api.myanimelist.net/v2/anime/${animeId}`, {
      headers: {
       Authorization: `Bearer ${user.mal.accessToken}` // ✅ correct key

      },
      params: {
        fields: 'title,main_picture,genres,studios,num_episodes',
      },
    });

    const anime = response.data;

    console.log("🎯 MAL Anime Response:", JSON.stringify(anime, null, 2));

    const newEntry = {
      animeId: anime.id,
      title: anime.title || 'Unknown Title',
      main_picture: anime.main_picture || {},
      genres: Array.isArray(anime.genres) ? anime.genres.map(g => ({ id: g.id, name: g.name })) : [],
      studios: Array.isArray(anime.studios) ? anime.studios.map(s => ({ id: s.id, name: s.name })) : [],
      totalEpisodes: anime.num_episodes || 0,
      status: status || 'plan_to_watch',
      rating: null,
      progress: 0,
      is_rewatching: false,
      rewatch_count: 0,
      notes: '',
    };

    console.log("✅ New Watchlist Entry:", newEntry);

    user.watchlist.push(newEntry);
    await user.save();

    res.status(201).json({ message: 'Anime added', watchlist: user.watchlist });
  } catch (error) {
    console.error('Add watchlist error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error adding anime to watchlist' });
  }
});

// ✅ PUT /api/user/watchlist/:animeId
router.put('/:animeId', async (req, res) => {
  try {
    const { animeId } = req.params;
    const updates = req.body;
    const user = req.user;

    if (!user) return res.status(404).json({ message: 'User not found' });

    const anime = user.watchlist.find(entry => entry.animeId == animeId);
    if (!anime) return res.status(404).json({ message: 'Anime not found in watchlist' });

    Object.assign(anime, updates);
    await user.save();

    res.status(200).json({ message: 'Anime updated', watchlist: user.watchlist });
  } catch (error) {
    console.error('Update watchlist error:', error.message);
    res.status(500).json({ message: 'Error updating anime in watchlist' });
  }
});

// ✅ DELETE /api/user/watchlist/:animeId
router.delete('/:animeId', async (req, res) => {
  try {
    const { animeId } = req.params;
    const user = req.user;

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.watchlist = user.watchlist.filter(entry => entry.animeId != animeId);
    await user.save();

    res.status(200).json({ message: 'Anime removed', watchlist: user.watchlist });
  } catch (error) {
    console.error('Delete watchlist error:', error.message);
    res.status(500).json({ message: 'Error removing anime from watchlist' });
  }
});

module.exports = router;
