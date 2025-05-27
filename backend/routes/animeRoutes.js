
const express = require('express');
const axios = require('axios');
const router = express.Router();

const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID;

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

router.get('/top-airing', async (req, res) => {
  try {
    console.log('Fetching top airing anime...');
    const headers = {};
    if (MAL_CLIENT_ID) {
      headers['X-MAL-CLIENT-ID'] = MAL_CLIENT_ID;
    }

    const { year, season } = getCurrentYearAndSeason();
    const apiUrl = `https://api.myanimelist.net/v2/anime/season/${year}/${season}?limit=10&fields=synopsis,main_picture`;

    console.log('Requesting MAL API with URL:', apiUrl); // Log the constructed URL

    const response = await axios.get(apiUrl, {
      headers: headers,
    });

    console.log('MAL API Response Status:', response.status);
    console.log('MAL API Response Headers:', response.headers);
    console.log('MAL API Response Data:', response.data);

    const topAiringAnime = response.data.data.map((item) => ({
      id: item.node.id,
      title: item.node.title,
      main_picture: item.node.main_picture?.medium,
      synopsis: item.node.synopsis,
    }));

    console.log('Processed Top Airing Anime:', topAiringAnime);
    res.json(topAiringAnime);
  } catch (error) {
    console.error('Error fetching top airing anime from MyAnimeList:', error);
    res.status(500).json({ error: 'Failed to fetch top airing anime' });
  }
});

module.exports = router;