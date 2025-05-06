const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to get the current user's information
router.get('/me', userController.getCurrentUser);

// Route to fetch the user's anime list
router.get('/animelist', userController.fetchAnimeList); // ADD THIS LINE

module.exports = router;