// animeRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID;

if (!MAL_CLIENT_ID) {
    console.error("MAL_CLIENT_ID is not set. Please check your .env file.");
}

// Genre ID Mapping for MyAnimeList API
const MAL_GENRE_MAP = {
    'Action': 1, 'Adventure': 2, 'Cars': 3, 'Comedy': 4, 'Dementia': 5,
    'Demons': 6, 'Mystery': 7, 'Drama': 8, 'Ecchi': 9, 'Fantasy': 10,
    'Game': 11, 'Hentai': 12, 'Historical': 13, 'Horror': 14, 'Kids': 15,
    'Magic': 16, 'Mecha': 17, 'Music': 19, 'Parody': 20, 'Samurai': 21,
    'Romance': 22, 'School': 23, 'Sci-Fi': 24, 'Shoujo': 25, 'Shoujo Ai': 26,
    'Shounen': 27, 'Shounen Ai': 28, 'Slice of Life': 36, 'Space': 29,
    'Sports': 30, 'Super Power': 31, 'Vampire': 32, 'Yaoi': 33, 'Yuri': 34,
    'Harem': 35, 'Supernatural': 37, 'Military': 38, 'Police': 39,
    'Psychological': 40, 'Thriller': 41, 'Seinen': 42, 'Josei': 43,
};

// Helper function to get current year and season
function getCurrentYearAndSeason() {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const season = ['winter', 'spring', 'summer', 'fall'][Math.floor(month / 3)];
    return { year, season };
}

// --- Top Airing Anime ---
router.get('/top-airing', async (req, res) => {
    try {
        const { year, season } = { year: 2025, season: 'spring' }; // getCurrentYearAndSeason();
        const apiUrl = `https://api.myanimelist.net/v2/anime/season/${year}/${season}?limit=20&fields=main_picture,mean,synopsis`;

        const response = await axios.get(apiUrl, {
            headers: { 'X-MAL-CLIENT-ID': MAL_CLIENT_ID }
        });

        const anime = response.data.data.map(item => ({
            id: item.node.id,
            title: item.node.title,
            main_picture: item.node.main_picture?.medium,
            synopsis: item.node.synopsis,
            mean: item.node.mean
        }));

        res.json(anime);
    } catch (err) {
        console.error("Top Airing Error:", err.response?.data || err.message);
        res.status(err.response?.status || 500).json({ error: "Failed to fetch top airing anime" });
    }
});

// --- Top Rated Anime ---
router.get('/top-rated', async (req, res) => {
    try {
        const apiUrl = `https://api.myanimelist.net/v2/anime/ranking?ranking_type=all&limit=20&fields=main_picture,mean,synopsis`;

        const response = await axios.get(apiUrl, {
            headers: { 'X-MAL-CLIENT-ID': MAL_CLIENT_ID }
        });

        const anime = response.data.data.map(item => ({
            id: item.node.id,
            title: item.node.title,
            main_picture: item.node.main_picture?.medium,
            synopsis: item.node.synopsis,
            mean: item.node.mean
        }));

        res.json(anime);
    } catch (err) {
        console.error("Top Rated Error:", err.response?.data || err.message);
        res.status(err.response?.status || 500).json({ error: "Failed to fetch top rated anime" });
    }
});

// --- Popular This Season ---
router.get('/popular-season', async (req, res) => {
    try {
        const apiUrl = `https://api.myanimelist.net/v2/anime/ranking?ranking_type=bypopularity&limit=20&fields=main_picture,mean,synopsis`;

        const response = await axios.get(apiUrl, {
            headers: { 'X-MAL-CLIENT-ID': MAL_CLIENT_ID }
        });

        const anime = response.data.data.map(item => ({
            id: item.node.id,
            title: item.node.title,
            main_picture: item.node.main_picture?.medium,
            synopsis: item.node.synopsis,
            mean: item.node.mean
        }));

        res.json(anime);
    } catch (err) {
        console.error("Popular Season Error:", err.response?.data || err.message);
        res.status(err.response?.status || 500).json({ error: "Failed to fetch popular season anime" });
    }
});

// --- Global Search (q + genre optional) ---
router.get('/search', async (req, res) => {
    let { q, limit = 20, offset = 0, genre } = req.query;

    if (!q && (!genre || genre === 'All')) {
        return res.status(400).json({ message: "Search query or specific genre required" });
    }

    const malGenreIds = genre && MAL_GENRE_MAP[genre] ? [MAL_GENRE_MAP[genre]] : [];

    const params = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        fields: 'id,title,main_picture,mean,synopsis',
        q: q?.trim() || (malGenreIds.length > 0 ? 'anime' : undefined),
        genre_ids: malGenreIds.join(',')
    };

    try {
        const apiUrl = 'https://api.myanimelist.net/v2/anime';

        const response = await axios.get(apiUrl, {
            headers: { 'X-MAL-CLIENT-ID': MAL_CLIENT_ID },
            params
        });

        const anime = response.data.data.map(item => ({
            id: item.node.id,
            title: item.node.title,
            main_picture: item.node.main_picture?.medium,
            synopsis: item.node.synopsis,
            mean: item.node.mean
        }));

        res.json({ data: anime, paging: response.data.paging });
    } catch (err) {
        console.error("Search Error:", err.response?.data || err.message);
        res.status(err.response?.status || 500).json({ error: "Search failed", details: err.response?.data });
    }
});


// --- NEW: Genre-Based Seasonal Filter Route ---
// --- Fixed: Genre-Based Search Using Jikan API ---
router.get('/genre-based', async (req, res) => {
    const { genre } = req.query;

    if (!genre || !MAL_GENRE_MAP[genre]) {
        return res.status(400).json({ error: 'Invalid or missing genre' });
    }

    const genreId = MAL_GENRE_MAP[genre];

    try {
       const jikanUrl = `https://api.jikan.moe/v4/anime?genres=${genreId}&order_by=score&sort=desc&limit=24`;

        const response = await axios.get(jikanUrl);

        const anime = response.data.data.map(item => ({
            id: item.mal_id,
            title: item.title,
            main_picture: item.images?.jpg?.image_url,
            synopsis: item.synopsis,
            mean: item.score,
        }));

        res.json(anime);
    } catch (err) {
        console.error("Genre-Based Jikan Error:", err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            error: "Failed to fetch anime details",
            details: err.response?.data
        });
    }
});


// --- Single Anime by ID (with characters, related_anime) ---
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const apiUrl = `https://api.myanimelist.net/v2/anime/${id}?fields=id,title,main_picture,synopsis,mean,num_episodes,start_date,end_date,genres,studios,status,broadcast,rating,statistics,popularity,num_list_users,rank,characters,related_anime,background`;

        const response = await axios.get(apiUrl, {
            headers: { 'X-MAL-CLIENT-ID': MAL_CLIENT_ID }
        });

        const anime = {
            id: response.data.id,
            title: response.data.title,
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
            characters: response.data.characters,
            related_anime: response.data.related_anime,
        };

        res.json(anime);
    } catch (err) {
        console.error(`Error fetching anime with ID ${id}:`, err.response?.data || err.message);
        res.status(err.response?.status || 500).json({ error: "Failed to fetch anime details", details: err.response?.data });
    }
});


module.exports = router;

