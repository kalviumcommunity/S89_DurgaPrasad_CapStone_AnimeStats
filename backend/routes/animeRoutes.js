
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
    'Hentai': 12,
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
};


// Function to get the current year and season
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
router.get('/top-airing', async (req, res) => {
  try {
    console.log('Fetching top airing anime...');
    const headers = {};
    if (MAL_CLIENT_ID) {
      headers['X-MAL-CLIENT-ID'] = MAL_CLIENT_ID;
    } else {
        return res.status(500).json({ error: 'MAL_CLIENT_ID is not configured' });
    }

    // Using 2025/spring for consistent testing. Adjust if you need real current season
    const { year, season } = { year: 2025, season: 'spring' }; // getCurrentYearAndSeason();
    const apiUrl = `https://api.myanimelist.net/v2/anime/season/${year}/${season}?limit=20&fields=main_picture,mean,synopsis`;

    console.log('Requesting MAL API (Top Airing) with URL:', apiUrl);

    const response = await axios.get(apiUrl, { headers: headers });

    console.log('MAL API Response Status (Top Airing):', response.status);

    const topAiringAnime = response.data.data.map((item) => ({
      id: item.node.id,
      title: item.node.title,
      // Ensure this matches how you expect the frontend to use it
      main_picture: item.node.main_picture?.medium,
      synopsis: item.node.synopsis,
      mean: item.node.mean
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

    const apiUrl = `https://api.myanimelist.net/v2/anime/ranking?ranking_type=all&limit=20&fields=main_picture,mean,synopsis`;

    console.log('Requesting MAL API (Top Rated) with URL:', apiUrl);

    const response = await axios.get(apiUrl, { headers: headers });

    console.log('MAL API Response Status (Top Rated):', response.status);

    const topRatedAnime = response.data.data.map((item) => ({
      id: item.node.id,
      title: item.node.title,
      // Ensure this matches how you expect the frontend to use it
      main_picture: item.node.main_picture?.medium,
      synopsis: item.node.synopsis,
      mean: item.node.mean
    }));

    console.log('Processed Top Rated Anime (Count):', topRatedAnime.length);
    res.json(topRatedAnime);
  } catch (error) {
    console.error('Error fetching top rated anime from MyAnimeList:', error.response?.data?.message || error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch top rated anime', details: error.response?.data });
  }
});


// --- NEW: /api/anime/popular-season endpoint ---
router.get('/popular-season', async (req, res) => {
    try {
        console.log('Fetching popular season anime...');
        const headers = {};
        if (MAL_CLIENT_ID) {
            headers['X-MAL-CLIENT-ID'] = MAL_CLIENT_ID;
        } else {
            return res.status(500).json({ error: 'MAL_CLIENT_ID is not configured' });
        }

        const apiUrl = `https://api.myanimelist.net/v2/anime/ranking?ranking_type=bypopularity&limit=20&fields=main_picture,mean,synopsis`;

        console.log('Requesting MAL API (Popular Season) with URL:', apiUrl);

        const response = await axios.get(apiUrl, { headers: headers });

        console.log('MAL API Response Status (Popular Season):', response.status);

        const popularSeasonAnime = response.data.data.map((item) => ({
            id: item.node.id,
            title: item.node.title,
            // Ensure this matches how you expect the frontend to use it
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


// --- Global Search Endpoint ---
router.get('/search', async (req, res) => {
    let { q, limit = 20, offset = 0, genre } = req.query;

    // Our backend's own validation
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
            fields: 'id,title,main_picture,mean,synopsis',
        };

        // --- THE CRUCIAL CHANGE HERE ---
        // If 'q' from the frontend is missing or empty, AND genre_ids are present,
        // then MyAnimeList seems to require a non-empty 'q'.
        // We'll provide a generic 'anime' search query to satisfy this.
        if (!q || q.trim() === '') { // If q is undefined or just whitespace
            if (malGenreIds.length > 0) { // AND a genre is selected
                params.q = 'anime'; // Use a generic query
            }
            // If no q and no genre, the 400 at the top handles it, so no 'q' parameter is needed for MAL
        } else {
            // If q is provided and not empty, use the provided q.
            params.q = q;
        }


        if (malGenreIds.length > 0) {
            params.genre_ids = malGenreIds.join(',');
        }

        const apiUrl = 'https://api.myanimelist.net/v2/anime';

        console.log('Requesting MAL API (Global Search) with URL:', apiUrl, 'Params:', params);

        const response = await axios.get(apiUrl, { headers: headers, params: params });

        console.log('MAL API Response Status (Global Search):', response.status);

        const animeData = response.data.data.map(item => ({
            id: item.node.id,
            title: item.node.title,
            main_picture: item.node.main_picture ? item.node.main_picture.medium : null,
            synopsis: item.node.synopsis,
            mean: item.node.mean
        }));

        res.json({
            data: animeData,
            paging: response.data.paging
        });

    } catch (error) {
        console.error('Error in /api/anime/search from MyAnimeList:', error.response?.data?.message || error.message);
        res.status(error.response?.status || 500).json({ message: 'Failed to fetch search results.', details: error.response?.data });
    }
});

// Route for fetching a single anime's details by ID (for detail page)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const headers = {};
    if (MAL_CLIENT_ID) {
      headers['X-MAL-CLIENT-ID'] = MAL_CLIENT_ID;
    } else {
      return res.status(500).json({ error: 'MAL_CLIENT_ID is not configured' });
    }

    // THIS IS THE CRUCIAL PART TO CHANGE: Add 'characters' and 'related_anime' to fields
    const apiUrl = `https://api.myanimelist.net/v2/anime/${id}?fields=id,title,main_picture,synopsis,mean,num_episodes,start_date,end_date,genres,studios,status,broadcast,rating,statistics,popularity,num_list_users,rank,characters,related_anime,background`;


    console.log(`Requesting MAL API (Single Anime) with URL: ${apiUrl}`);

    const response = await axios.get(apiUrl, { headers: headers });

    console.log(`MAL API Response Status (Single Anime): ${response.status}`);

    const animeDetails = {
      id: response.data.id,
      title: response.data.title,
      // For detail page, we usually want the larger image
      main_picture: response.data.main_picture?.large || response.data.main_picture?.medium,
      synopsis: response.data.synopsis,
      mean: response.data.mean,
      num_episodes: response.data.num_episodes,
      start_date: response.data.start_date,
      end_date: response.data.end_date,
      genres: response.data.genres,
      studios: response.data.studios,
      status: response.data.status,
      broadcast: response.data.broadcast,
      rating: response.data.rating,
      statistics: response.data.statistics,
      popularity: response.data.popularity,
      num_list_users: response.data.num_list_users,
      rank: response.data.rank,
      // THIS IS THE CRUCIAL PART TO CHANGE: Map characters and related_anime
      characters: response.data.characters, // MAL API v2 directly returns characters array like this
      related_anime: response.data.related_anime // MAL API v2 directly returns related_anime array like this
    };

    res.json(animeDetails);

  } catch (error) {
    console.error(`Error fetching anime with ID ${id} from MyAnimeList:`, error.response?.data?.message || error.message);
    res.status(error.response?.status || 500).json({ error: `Failed to fetch anime with ID ${id}`, details: error.response?.data });
  }
});


module.exports = router;