# S89_DurgaPrasad_CapStone_AnimeStats

# Anime Watchlist Tracker - Project Documentation

# Project Overview
The Anime Watchlist Tracker is a web application designed for anime fans to track their watchlist, get personalized recommendations, and explore trending anime. It integrates with MyAnimeList for user authentication and watchlist data, and uses Jikan API for fetching anime details.

# Tech Stack:
- Frontend: HTML, CSS, JavaScript, React
- Backend: Express.js, Mongoose, MongoDB
- API Integration: MyAnimeList OAuth, Jikan API
- Hosting: Netlify,render

# Features
# 1. User Authentication (MyAnimeList OAuth)
- Users log in via MyAnimeList OAuth, which allows the app to access their anime watchlist.
- Fetches user data like watch status, ratings, and anime lists.

# 2. Watchlist & Stats Tracking
- Displays a detailed watchlist including:
- Anime titles
- Watch status (Watching, Completed, Dropped, On Hold, Plan to Watch)
- User ratings
- Anime cover images

# * Provides detailed stats:
- Seasons and episodes left to complete a series
- Total anime watched and progress
- Graphical representation of watch history

# 3. Personalized Anime Recommendations
- If a user stops at an episode, the system reminds them of what they are missing.
* Recommends similar anime based on:
- Jikan API data (for quick recommendations).
- User’s watch history stored in MongoDB (for deep personalization).

# 4. Explore & Search Anime
- Users can search for anime and get details like synopsis, rating, and user stats.
- A genre selection bar helps users find anime by category.
- Displays Top Airing & Top Rated anime fetched from Jikan API.

# 5. Anime News Section
- Fetches and displays the latest anime news from external sources.

# Tech Stack & API Usage
- Frontend (React)
- React.js for building the user interface.
- CSS & Styled Components for styling.
- React Router for navigation.
- Backend (Express, MongoDB)
- Express.js for server-side logic.
- Mongoose & MongoDB for storing user watch history and preferences.

# API Integrations
🔹 Jikan API
- Fetches anime details, top airing anime, top rated anime, and search results.
- Provides genre-based filtering.

🔹 MyAnimeList OAuth API
- Authenticates users and fetches their watchlist & ratings.
- Tracks watch status (Watching, Dropped, Completed, etc.).

# How It Works
# Step 1: User Login
- Users log in via MyAnimeList OAuth (this redirects them to MyAnimeList to authorize access).
- The system fetches their watchlist, ratings, and statuses.

# Step 2: Watchlist & Stats Tracking
- The user’s anime watchlist is displayed.
* Unique stats are calculated:
- Number of episodes left
- Total anime completed
- Personalized progress analysis

# Step 3: Recommendations System
- If a user stops at an episode, the system notifies them and suggests similar anime.
- Uses Jikan API for quick recommendations.
- Uses MongoDB stored user history for deeper personalization.

# Step 4: Explore Anime & News
- Users can search for anime and view details.
- A Top Airing & Top Rated anime section is displayed.
- A genre selection bar helps users filter anime.
- The Anime News Section keeps users updated on the latest anime trends.

# Future Enhancements
* Anime Trailer Integration – Display trailers using YouTube API.
* Friend System – Compare anime watchlists with friends.
* Leaderboard & Challenges – Gamify anime tracking with badges & points.

# Final Thoughts
* Easy to use – Simple UI with interactive tracking.
* Unique Stats – No other website provides this level of anime watch progress detail.
* Completely Free – No paid subscriptions needed.
* Optimized Design – Dark mode with a clean, anime-friendly aesthetic.

**This project aims to be the ultimate anime watchlist tracker with deep stats & recommendations!**


# Weekly Plan for Anime Watchlist Tracker

# Week 1: April 9 - April 15
* Focus: Project Setup + Frontend Basic Pages
- Set up the project repository (GitHub).
- Initialize React app (Vite/CRA).
- Install required libraries (React Router, Styled Components, Axios, etc.).
- Set up basic file structure for frontend (pages, components, services folders).
- Create basic frontend pages (routes):
- Home Page (Top Airing & Top Rated section placeholder).
- Watchlist Page (blank).
- Stats Dashboard Page (blank).
- Search Page (blank).
- News Section (blank).
- Basic dark mode theme setup (global CSS / Styled Components ThemeProvider).

# Week 2: April 16 - April 22
* Focus: Backend Setup + User Authentication
- Initialize backend server (Express.js).
- Connect to MongoDB database using Mongoose.
- Set up user model for storing user data & watch history.
- Implement MyAnimeList OAuth authentication (basic login flow).
- After login, fetch user profile and watchlist data.
- Store initial fetched user data into MongoDB.

* Frontend:
- Implement login page and handle MyAnimeList OAuth flow.
- Show "Logged In" state after successful login.


# Week 3: April 23 - April 29
* Focus: Watchlist Display + Basic Stats

* Backend:
- Create API endpoints to fetch and update watchlist data.

* Frontend:
- Display the user's anime watchlist (title, image, watch status, rating).

* Display simple stats:
- Total anime watched.
- Anime by status (Watching, Completed, etc.).
- Integrate Jikan API to fetch anime cover images if needed.
- Build Watchlist Page UI (with progress bars, status tags).


# Week 4: April 30 - May 6
* Focus: Recommendations System + Explore Page

* Backend:
- Design logic to suggest anime if a user stops mid-series (based on history).
- Create recommendation engine (basic version using Jikan API).

* Frontend:
- Display recommendations in Stats Dashboard.
- Build Explore/Search page:
- Anime search input.
- Search results display (synopsis, rating, cover image).
- Genre filter bar.
- Display Top Airing and Top Rated anime using Jikan API.

# Week 5: May 7 - May 15
* Focus: Anime News, Final Polish & Testing
- Integrate Anime News API (or fetch latest news articles manually).
- Build Anime News section on frontend.
- Add UI hover effects, button styles, final polish.
- Responsive design check (mobile/tablet).

* Full testing:
- Test user login/logout.
- Test watchlist fetch and update.
- Test recommendation notifications.
- Test search and explore features.
- Test news fetching.
- Finalize hosting:
- Frontend on Netlify.
- Backend on Render, Railway, or another serverless platform.

**Final debugging and performance optimization**