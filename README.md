# AnimeStats - Anime Watchlist & Analytics Platform

## Live Demo

https://animestats89.netlify.app/

---

# Overview

AnimeStats is a full-stack anime tracking and analytics platform built for anime fans to manage their watchlists, explore trending anime, track detailed progress statistics, and receive personalized anime recommendations.

The application integrates MyAnimeList OAuth for authentication and Jikan API for real-time anime data fetching.

---

# Features

## Authentication

* Secure login using MyAnimeList OAuth
* Fetches user anime lists, ratings, and watch status
* Personalized user experience

## Watchlist Tracking

* Track anime watch progress
* Display anime cover images and details
* Watch statuses:

  * Watching
  * Completed
  * Dropped
  * On Hold
  * Plan to Watch

## Advanced Anime Statistics

* Episodes remaining to complete a series
* Total anime watched
* Personalized watch progress analytics
* Visual representation of anime activity

## Personalized Recommendations

* Anime recommendations based on user watch history
* Smart suggestions when users stop watching a series
* Genre-based recommendation system

## Explore Anime

* Global anime search
* Genre filtering
* Top Airing Anime section
* Top Rated Anime section
* Detailed anime information including:

  * Synopsis
  * Ratings
  * Popularity
  * User statistics

## Anime News

* Displays latest anime-related updates and news

---

# Tech Stack

## Frontend

* React.js
* HTML5
* CSS3
* JavaScript
* React Router

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* Mongoose

## APIs

* MyAnimeList OAuth API
* Jikan API

## Deployment

* Netlify (Frontend)
* Render (Backend)

---

# API Integrations

## Jikan API

Used for:

* Anime search
* Top airing anime
* Top rated anime
* Genre filtering
* Anime recommendations

## MyAnimeList OAuth API

Used for:

* User authentication
* Watchlist access
* Ratings & anime status tracking

---

# Project Workflow

## Step 1: User Authentication

Users log in through MyAnimeList OAuth to securely access their anime data.

## Step 2: Watchlist & Statistics

The application fetches and displays:

* Watch history
* Anime progress
* Episodes left
* Personalized analytics

## Step 3: Recommendation Engine

The system recommends anime based on:

* User watch history
* Similar anime genres
* User engagement patterns

## Step 4: Anime Exploration

Users can:

* Search anime
* Filter by genre
* Explore top anime
* Read anime news updates

---

# Installation & Setup

## Clone Repository

```bash
git clone https://github.com/TSDPRASAD88/S89_DurgaPrasad_CapStone_AnimeStats.git
```

## Install Frontend Dependencies

```bash
cd client
npm install
```

## Install Backend Dependencies

```bash
cd server
npm install
```

## Run Frontend

```bash
npm run dev
```

## Run Backend

```bash
npm start
```

---

# Environment Variables

Create a `.env` file inside the server folder and add:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
CLIENT_ID=your_mal_client_id
CLIENT_SECRET=your_mal_client_secret
SESSION_SECRET=your_session_secret
```

---

# Future Enhancements

* Anime trailer integration using YouTube API
* Friend system for comparing watchlists
* Leaderboards & achievement badges
* AI-powered recommendation system
* Mobile responsive improvements

---

# Author

## Thamarana Satya Durga Prasad

* GitHub: https://github.com/TSDPRASAD88
* LinkedIn: [www.linkedin.com/in/satya-durga-prasad-thamarana-a65324326
]

---

# Final Note

AnimeStats was built to provide anime fans with a clean, interactive, and data-rich anime tracking experience with deep watch analytics and personalized recommendations.
