// // server/routes/animeRoutes.js
// const express = require('express');
// const axios = require('axios');
// const router = express.Router();

// // Make sure your .env file is loaded where you use this router (e.g., in your main server.js)
// // For example, in server.js: require('dotenv').config();
// const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID;

// if (!MAL_CLIENT_ID) {
//     console.error("MAL_CLIENT_ID is not set. Please check your .env file and server setup.");
//     // In a production app, you might want to throw an error or handle this more robustly
// }

// // --- IMPORTANT: Genre ID Mapping for MyAnimeList API ---
// // This map converts common genre names (from frontend buttons) to MAL API v2 genre_ids.
// // You can get a full list of genres with their IDs from:
// // https://api.myanimelist.net/v2/genres/anime
// const MAL_GENRE_MAP = {
//     'Action': 1,
//     'Adventure': 2,
//     'Cars': 3,
//     'Comedy': 4,
//     'Dementia': 5,
//     'Demons': 6,
//     'Mystery': 7,
//     'Drama': 8,
//     'Ecchi': 9,
//     'Fantasy': 10,
//     'Game': 11,
//     'Hentai': 12, // Be cautious if not intentionally including adult content
//     'Historical': 13,
//     'Horror': 14,
//     'Kids': 15,
//     'Magic': 16,
//     'Mecha': 17,
//     'Music': 19,
//     'Parody': 20,
//     'Samurai': 21,
//     'Romance': 22,
//     'School': 23,
//     'Sci-Fi': 24,
//     'Shoujo': 25,
//     'Shoujo Ai': 26,
//     'Shounen': 27,
//     'Shounen Ai': 28,
//     'Slice of Life': 36,
//     'Space': 29,
//     'Sports': 30,
//     'Super Power': 31,
//     'Vampire': 32,
//     'Yaoi': 33,
//     'Yuri': 34,
//     'Harem': 35,
//     'Supernatural': 37,
//     'Military': 38,
//     'Police': 39,
//     'Psychological': 40,
//     'Thriller': 41,
//     'Seinen': 42,
//     'Josei': 43,
//     // Add more as needed based on MAL API's genre list
// };


// // Function to get the current year and season (already existing)
// function getCurrentYearAndSeason() {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = now.getMonth(); // 0 = January, 11 = December

//   let season = '';
//   if (month >= 0 && month <= 2) {
//     season = 'winter';
//   } else if (month >= 3 && month <= 5) {
//     season = 'spring';
//   } else if (month >= 6 && month <= 8) {
//     season = 'summer';
//   } else {
//     season = 'fall';
//   }

//   return { year, season };
// }

// // --- Existing /api/anime/top-airing endpoint ---
// // Note: MAL's season endpoint does not support genre filtering directly.
// // The `genre` parameter from the frontend (if any) will be ignored by this route.
// router.get('/top-airing', async (req, res) => {
//   try {
//     console.log('Fetching top airing anime...');
//     const headers = {};
//     if (MAL_CLIENT_ID) {
//       headers['X-MAL-CLIENT-ID'] = MAL_CLIENT_ID;
//     } else {
//         return res.status(500).json({ error: 'MAL_CLIENT_ID is not configured' });
//     }

//     const { year, season } = getCurrentYearAndSeason();
//     // Fields for top airing: main_picture, mean (synopsis REMOVED)
//     const apiUrl = `https://api.myanimelist.net/v2/anime/season/${year}/${season}?limit=20&fields=main_picture,mean`;

//     console.log('Requesting MAL API (Top Airing) with URL:', apiUrl);

//     const response = await axios.get(apiUrl, { headers: headers });

//     console.log('MAL API Response Status (Top Airing):', response.status);

//     const topAiringAnime = response.data.data.map((item) => ({
//       id: item.node.id,
//       title: item.node.title,
//       main_picture: item.node.main_picture?.medium, // Use .medium for list view
//       // synopsis: item.node.synopsis, // REMOVED
//       mean: item.node.mean // Average score
//     }));

//     console.log('Processed Top Airing Anime (Count):', topAiringAnime.length);
//     res.json(topAiringAnime);
//   } catch (error) {
//     console.error('Error fetching top airing anime from MyAnimeList:', error.response?.data?.message || error.message);
//     res.status(error.response?.status || 500).json({ error: 'Failed to fetch top airing anime', details: error.response?.data });
//   }
// });

// // --- Existing /api/anime/top-rated endpoint ---
// router.get('/top-rated', async (req, res) => {
//   try {
//     console.log('Fetching top rated anime...');
//     const headers = {};
//     if (MAL_CLIENT_ID) {
//       headers['X-MAL-CLIENT-ID'] = MAL_CLIENT_ID;
//     } else {
//         return res.status(500).json({ error: 'MAL_CLIENT_ID is not configured' });
//     }

//     // Fields for top rated: main_picture, mean (synopsis REMOVED)
//     const apiUrl = `https://api.myanimelist.net/v2/anime/ranking?ranking_type=all&limit=20&fields=main_picture,mean`;

//     console.log('Requesting MAL API (Top Rated) with URL:', apiUrl);

//     const response = await axios.get(apiUrl, { headers: headers });

//     console.log('MAL API Response Status (Top Rated):', response.status);

//     const topRatedAnime = response.data.data.map((item) => ({
//       id: item.node.id,
//       title: item.node.title,
//       main_picture: item.node.main_picture?.medium, // Use .medium for list view
//       // synopsis: item.node.synopsis, // REMOVED
//       mean: item.node.mean // Average score
//     }));

//     console.log('Processed Top Rated Anime (Count):', topRatedAnime.length);
//     res.json(topRatedAnime);
//   } catch (error) {
//     console.error('Error fetching top rated anime from MyAnimeList:', error.response?.data?.message || error.message);
//     res.status(error.response?.status || 500).json({ error: 'Failed to fetch top rated anime', details: error.response?.data });
//   }
// });


// // --- NEW: /api/anime/popular-season endpoint ---
// // This endpoint will also use the /anime/ranking endpoint, suitable for a "Popular This Season" section.
// // Note: MAL's ranking endpoint does not support genre filtering directly.
// // The `genre` parameter from the frontend (if any) will be ignored by this route.
// router.get('/popular-season', async (req, res) => {
//     try {
//         console.log('Fetching popular season anime...');
//         const headers = {};
//         if (MAL_CLIENT_ID) {
//             headers['X-MAL-CLIENT-ID'] = MAL_CLIENT_ID;
//         } else {
//             return res.status(500).json({ error: 'MAL_CLIENT_ID is not configured' });
//         }

//         // Using 'bypopularity' ranking type for general popular anime
//         // Fields for popular season: main_picture, mean (synopsis REMOVED)
//         const apiUrl = `https://api.myanimelist.net/v2/anime/ranking?ranking_type=bypopularity&limit=20&fields=main_picture,mean`;

//         console.log('Requesting MAL API (Popular Season) with URL:', apiUrl);

//         const response = await axios.get(apiUrl, { headers: headers });

//         console.log('MAL API Response Status (Popular Season):', response.status);

//         const popularSeasonAnime = response.data.data.map((item) => ({
//             id: item.node.id,
//             title: item.node.title,
//             main_picture: item.node.main_picture?.medium,
//             // synopsis: item.node.synopsis, // REMOVED
//             mean: item.node.mean
//         }));

//         console.log('Processed Popular Season Anime (Count):', popularSeasonAnime.length);
//         res.json(popularSeasonAnime);
//     } catch (error) {
//         console.error('Error fetching popular season anime from MyAnimeList:', error.response?.data?.message || error.message);
//         res.status(error.response?.status || 500).json({ error: 'Failed to fetch popular season anime', details: error.response?.data });
//     }
// });


// // --- NEW: Global Search Endpoint ---
// // This endpoint supports both a text search query (q) and/or a genre filter (genre).
// router.get('/search', async (req, res) => {
//     const { q, limit = 20, offset = 0, genre } = req.query; // 'genre' parameter will be genre name

//     // Validate input: at least a query or a specific genre is needed for a valid search
//     if (!q && (!genre || genre === 'All')) {
//         return res.status(400).json({ message: 'Search query (q) or a specific genre is required.' });
//     }

//     const headers = {};
//     if (MAL_CLIENT_ID) {
//         headers['X-MAL-CLIENT-ID'] = MAL_CLIENT_ID;
//     } else {
//         return res.status(500).json({ error: 'MAL_CLIENT_ID is not configured' });
//     }

//     let malGenreIds = [];
//     if (genre && genre !== 'All' && MAL_GENRE_MAP[genre]) {
//         malGenreIds.push(MAL_GENRE_MAP[genre]);
//     }

//     try {
//         const params = {
//             limit: parseInt(limit),
//             offset: parseInt(offset),
//             fields: 'id,title,main_picture,mean', // Request relevant fields for search results (synopsis REMOVED)
//         };

//         if (q) {
//             params.q = q; // Add search query if provided
//         }
//         if (malGenreIds.length > 0) {
//             params.genre_ids = malGenreIds.join(','); // Add comma-separated genre IDs
//         }

//         const apiUrl = 'https://api.myanimelist.net/v2/anime'; // General anime search endpoint

//         console.log('Requesting MAL API (Global Search) with URL:', apiUrl, 'Params:', params);

//         const response = await axios.get(apiUrl, { headers: headers, params: params });

//         console.log('MAL API Response Status (Global Search):', response.status);

//         const animeData = response.data.data.map(item => ({
//             id: item.node.id,
//             title: item.node.title,
//             main_picture: item.node.main_picture ? item.node.main_picture.large : null, // Use large for detail view, medium for lists
//             // synopsis: item.node.synopsis, // REMOVED
//             mean: item.node.mean
//         }));

//         res.json({
//             data: animeData,
//             paging: response.data.paging // Include paging information for frontend pagination (e.g., total count)
//         });

//     } catch (error) {
//         console.error('Error in /api/anime/search from MyAnimeList:', error.response?.data?.message || error.message);
//         res.status(error.response?.status || 500).json({ message: 'Failed to fetch search results.', details: error.response?.data });
//     }
// });

// module.exports = router;
// server/routes/animeRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Make sure your .env file is loaded where you use this router (e.g., in your main server.js)
// For example, in server.js: require('dotenv').config();
const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID;

if (!MAL_CLIENT_ID) {
    console.error("MAL_CLIENT_ID is not set. Please check your .env file and server setup.");
    // In a production app, you might want to throw an error or handle this more robustly
}

// --- IMPORTANT: Genre ID Mapping for MyAnimeList API ---
// This map converts common genre names (from frontend buttons) to MAL API v2 genre_ids.
// You can get a full list of genres with their IDs from:
// https://api.myanimelist.net/v2/genres/anime
const MAL_GENRE_MAP = {
    'Action': 1,
    'Adventure': 2,
    'Cars': 3,
    'Comedy': 4,
    'Dementia': 5,
    'Demons': 6,
    'Mystery': 7,
    'Drama': 8,
    'Ecchi': 9,
    'Fantasy': 10,
    'Game': 11,
    'Hentai': 12, // Be cautious if not intentionally including adult content
    'Historical': 13,
    'Horror': 14,
    'Kids': 15,
    'Magic': 16,
    'Mecha': 17,
    'Music': 19,
    'Parody': 20,
    'Samurai': 21,
    'Romance': 22,
    'School': 23,
    'Sci-Fi': 24,
    'Shoujo': 25,
    'Shoujo Ai': 26,
    'Shounen': 27,
    'Shounen Ai': 28,
    'Slice of Life': 36,
    'Space': 29,
    'Sports': 30,
    'Super Power': 31,
    'Vampire': 32,
    'Yaoi': 33,
    'Yuri': 34,
    'Harem': 35,
    'Supernatural': 37,
    'Military': 38,
    'Police': 39,
    'Psychological': 40,
    'Thriller': 41,
    'Seinen': 42,
    'Josei': 43,
    // Add more as needed based on MAL API's genre list
};


// Function to get the current year and season (already existing)
function getCurrentYearAndSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = January, 11 = December

  let season = '';
  if (month >= 0 && month <= 2) {
    season = 'winter';
  } else if (month >= 3 && month <= 5) {
    season = 'spring';
  } else if (month >= 6 && month <= 8) {
    season = 'summer';
  } else {
    season = 'fall';
  }

  return { year, season };
}

// --- Existing /api/anime/top-airing endpoint ---
// Note: MAL's season endpoint does not support genre filtering directly.
// The `genre` parameter from the frontend (if any) will be ignored by this route.
router.get('/top-airing', async (req, res) => {
  try {
    console.log('Fetching top airing anime...');
    const headers = {};
    if (MAL_CLIENT_ID) {
      headers['X-MAL-CLIENT-ID'] = MAL_CLIENT_ID;
    } else {
        return res.status(500).json({ error: 'MAL_CLIENT_ID is not configured' });
    }

    const { year, season } = getCurrentYearAndSeason();
    // Fields for top airing: synopsis, main_picture.medium (default for listing)
    const apiUrl = `https://api.myanimelist.net/v2/anime/season/${year}/${season}?limit=20&fields=synopsis,main_picture,mean`; // Added mean for consistency with other parts

    console.log('Requesting MAL API (Top Airing) with URL:', apiUrl);

    const response = await axios.get(apiUrl, { headers: headers });

    console.log('MAL API Response Status (Top Airing):', response.status);

    const topAiringAnime = response.data.data.map((item) => ({
      id: item.node.id,
      title: item.node.title,
      main_picture: item.node.main_picture?.medium, // Use .medium for list view
      synopsis: item.node.synopsis,
      mean: item.node.mean // Average score
    }));

    console.log('Processed Top Airing Anime (Count):', topAiringAnime.length);
    res.json(topAiringAnime);
  } catch (error) {
    console.error('Error fetching top airing anime from MyAnimeList:', error.response?.data?.message || error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch top airing anime', details: error.response?.data });
  }
});

// --- Existing /api/anime/top-rated endpoint ---
router.get('/top-rated', async (req, res) => {
  try {
    console.log('Fetching top rated anime...');
    const headers = {};
    if (MAL_CLIENT_ID) {
      headers['X-MAL-CLIENT-ID'] = MAL_CLIENT_ID;
    } else {
        return res.status(500).json({ error: 'MAL_CLIENT_ID is not configured' });
    }

    const apiUrl = `https://api.myanimelist.net/v2/anime/ranking?ranking_type=all&limit=20&fields=synopsis,main_picture,mean`; // Increased limit to 20 for consistency with carousels

    console.log('Requesting MAL API (Top Rated) with URL:', apiUrl);

    const response = await axios.get(apiUrl, { headers: headers });

    console.log('MAL API Response Status (Top Rated):', response.status);

    const topRatedAnime = response.data.data.map((item) => ({
      id: item.node.id,
      title: item.node.title,
      main_picture: item.node.main_picture?.medium, // Use .medium for list view
      synopsis: item.node.synopsis,
      mean: item.node.mean // Average score
    }));

    console.log('Processed Top Rated Anime (Count):', topRatedAnime.length);
    res.json(topRatedAnime);
  } catch (error) {
    console.error('Error fetching top rated anime from MyAnimeList:', error.response?.data?.message || error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch top rated anime', details: error.response?.data });
  }
});


// --- NEW: /api/anime/popular-season endpoint ---
// This endpoint will also use the /anime/ranking endpoint, suitable for a "Popular This Season" section.
// Note: MAL's ranking endpoint does not support genre filtering directly.
// The `genre` parameter from the frontend (if any) will be ignored by this route.
router.get('/popular-season', async (req, res) => {
    try {
        console.log('Fetching popular season anime...');
        const headers = {};
        if (MAL_CLIENT_ID) {
            headers['X-MAL-CLIENT-ID'] = MAL_CLIENT_ID;
        } else {
            return res.status(500).json({ error: 'MAL_CLIENT_ID is not configured' });
        }

        // Using 'bypopularity' ranking type for general popular anime
        const apiUrl = `https://api.myanimelist.net/v2/anime/ranking?ranking_type=bypopularity&limit=20&fields=synopsis,main_picture,mean`;

        console.log('Requesting MAL API (Popular Season) with URL:', apiUrl);

        const response = await axios.get(apiUrl, { headers: headers });

        console.log('MAL API Response Status (Popular Season):', response.status);

        const popularSeasonAnime = response.data.data.map((item) => ({
            id: item.node.id,
            title: item.node.title,
            main_picture: item.node.main_picture?.medium,
            synopsis: item.node.synopsis,
            mean: item.node.mean
        }));

        console.log('Processed Popular Season Anime (Count):', popularSeasonAnime.length);
        res.json(popularSeasonAnime);
    } catch (error) {
        console.error('Error fetching popular season anime from MyAnimeList:', error.response?.data?.message || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch popular season anime', details: error.response?.data });
    }
});


// --- NEW: Global Search Endpoint ---
// This endpoint supports both a text search query (q) and/or a genre filter (genre).
router.get('/search', async (req, res) => {
    const { q, limit = 20, offset = 0, genre } = req.query; // 'genre' parameter will be genre name

    // Validate input: at least a query or a specific genre is needed for a valid search
    if (!q && (!genre || genre === 'All')) {
        return res.status(400).json({ message: 'Search query (q) or a specific genre is required.' });
    }

    const headers = {};
    if (MAL_CLIENT_ID) {
        headers['X-MAL-CLIENT-ID'] = MAL_CLIENT_ID;
    } else {
        return res.status(500).json({ error: 'MAL_CLIENT_ID is not configured' });
    }

    let malGenreIds = [];
    if (genre && genre !== 'All' && MAL_GENRE_MAP[genre]) {
        malGenreIds.push(MAL_GENRE_MAP[genre]);
    }

    try {
        const params = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            fields: 'id,title,main_picture,synopsis,mean', // Request relevant fields for search results
        };

        if (q) {
            params.q = q; // Add search query if provided
        }
        if (malGenreIds.length > 0) {
            params.genre_ids = malGenreIds.join(','); // Add comma-separated genre IDs
        }

        const apiUrl = 'https://api.myanimelist.net/v2/anime'; // General anime search endpoint

        console.log('Requesting MAL API (Global Search) with URL:', apiUrl, 'Params:', params);

        const response = await axios.get(apiUrl, { headers: headers, params: params });

        console.log('MAL API Response Status (Global Search):', response.status);

        const animeData = response.data.data.map(item => ({
            id: item.node.id,
            title: item.node.title,
            main_picture: item.node.main_picture ? item.node.main_picture.large : null, // Use large for detail view, medium for lists
            synopsis: item.node.synopsis,
            mean: item.node.mean
        }));

        res.json({
            data: animeData,
            paging: response.data.paging // Include paging information for frontend pagination (e.g., total count)
        });

    } catch (error) {
        console.error('Error in /api/anime/search from MyAnimeList:', error.response?.data?.message || error.message);
        res.status(error.response?.status || 500).json({ message: 'Failed to fetch search results.', details: error.response?.data });
    }
});

module.exports = router;