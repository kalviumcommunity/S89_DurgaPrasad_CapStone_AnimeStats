const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
  },
  malId: {
    type: String,
    unique: true,
  },
  malUsername: {
    type: String,
    trim: true,
  },
  malAccessToken: {
    type: String,
  },
  malRefreshToken: {
    type: String,
  },
  malTokenExpiry: {
    type: Number,
  },
  watchlist: [{
    animeId: Number,
    status: String,
    rating: Number,
    // ... other watchlist details
  }],
  // ... other user-related fields ...
}, { timestamps: true });


// Check if the model has already been compiled
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
