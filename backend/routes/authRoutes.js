
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

console.log('authController:', authController);
console.log('login:', authController.login);
console.log('callback:', authController.callback);

router.get('/login', authController.login); 
router.get('/callback', authController.callback); 

module.exports = router;