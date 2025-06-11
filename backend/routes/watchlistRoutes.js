const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const isAuthenticated = require('../middleware/isAuthenticated'); // This path should now be correct

router.use(isAuthenticated); // Apply to all routes in this file

router.get('/', watchlistController.getUserWatchlist);
router.post('/', watchlistController.addAnimeToWatchlist);
router.put('/:animeId', watchlistController.updateAnimeInWatchlist);
router.delete('/:animeId', watchlistController.removeAnimeFromWatchlist);

module.exports = router;