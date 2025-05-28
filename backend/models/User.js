// user.js
const mongoose = require('mongoose');

const watchlistEntrySchema = new mongoose.Schema({
  animeId: Number,
  status: String,
  rating: Number,
  progress: Number,
  totalEpisodes: Number,
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    sparse: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    sparse: true,
  },
  password: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  name: String,
  profilePicture: String,

  malId: {
    type: String,
    sparse: true,
  },
  malUsername: {
    type: String,
    trim: true,
  },
  malAccessToken: String,
  malRefreshToken: String,
  malTokenExpiry: Number,

  watchlist: [watchlistEntrySchema],

  totalAnimeCompleted: { type: Number, default: 0 },
  episodesWatched: { type: Number, default: 0 },
  watchHistory: [{
    animeId: Number,
    dateCompleted: Date,
    rating: Number,
  }],


}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);