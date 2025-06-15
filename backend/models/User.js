// // user.js
// const mongoose = require('mongoose');

// // Updated watchlistEntrySchema
// const watchlistEntrySchema = new mongoose.Schema({
//   animeId: Number,
//   title: String, // NEW: For display and stats
//   main_picture: {
//     medium: String,
//     large: String,
//   },
//   genres: [
//     {
//       id: Number,
//       name: String,
//     }
//   ],
//   studios: [
//     {
//       id: Number,
//       name: String,
//     }
//   ],
//   status: String,
//   rating: Number,
//   progress: Number,
//   totalEpisodes: Number,
//   start_date: Date,
//   finish_date: Date,
//   is_rewatching: Boolean,
//   rewatch_count: Number,
//   notes: String,
// }, { _id: false });

// const UserSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     unique: true,
//     trim: true,
//     lowercase: true,
//     sparse: true,
//   },
//   email: {
//     type: String,
//     unique: true,
//     trim: true,
//     lowercase: true,
//     sparse: true,
//   },
//   password: {
//     type: String,
//     required: false,
//   },
//   googleId: {
//     type: String,
//     unique: true,
//     sparse: true,
//   },
//   name: String,
//   profilePicture: String,

//   malId: {
//     type: String,
//     sparse: true,
//   },
//   malUsername: {
//     type: String,
//     trim: true,
//   },
//   malAccessToken: String,
//   malRefreshToken: String,
//   malTokenExpiry: Number,

//   watchlist: [watchlistEntrySchema],

//   totalAnimeCompleted: { type: Number, default: 0 },
//   episodesWatched: { type: Number, default: 0 },
//   watchHistory: [{
//     animeId: Number,
//     dateCompleted: Date,
//     rating: Number,
//   }],
// }, { timestamps: true });

// module.exports = mongoose.models.User || mongoose.model('User', UserSchema);


// user.js
const mongoose = require('mongoose');

// ✅ Watchlist Entry Schema
const watchlistEntrySchema = new mongoose.Schema({
  animeId: Number,
  title: String,
  main_picture: {
    medium: String,
    large: String,
  },
  genres: [
    {
      id: Number,
      name: String,
    }
  ],
  studios: [
    {
      id: Number,
      name: String,
    }
  ],
  status: String,
  rating: Number,
  progress: Number,
  totalEpisodes: Number,
  start_date: Date,
  finish_date: Date,
  is_rewatching: Boolean,
  rewatch_count: Number,
  notes: String,
}, { _id: false });

// ✅ User Schema
const UserSchema = new mongoose.Schema({
  // Local or Google Auth
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

  // ✅ MyAnimeList OAuth
  mal: {
  username: String,
  accessToken: String,
  refreshToken: String,
  tokenType: String,
  expiresAt: Number,
  lastSynced: Date,
},

  malAuthenticated: {
    type: Boolean,
    default: false,
  },
  

  // ✅ Watchlist
  watchlist: [watchlistEntrySchema],

  // ✅ Stats
  totalAnimeCompleted: { type: Number, default: 0 },
  episodesWatched: { type: Number, default: 0 },
  watchHistory: [{
    animeId: Number,
    dateCompleted: Date,
    rating: Number,
  }],
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
