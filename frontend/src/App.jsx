import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { WatchlistProvider } from './WatchlistContext.jsx'; 

// Import all your page components
import LandingPage from './components/pages/LandingPage';
import HomePage from './components/pages/HomePage';
import LoginPage from './components/pages/LoginPage';
import SignupPage from './components/pages/SignupPage';
import DashboardPage from './components/pages/DashboardPage';
import SearchResultsPage from './components/pages/SearchResultsPage';
import AnimeDetailsPage from './components/pages/AnimeDetailsPage';
import WatchlistPage from './components/pages/WatchlistPage';
import StatsPage from './components/pages/StatsPage';

// ✅ FIX: Using the environment variable for the API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Correctly updated LinkMal component
const LinkMal = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // This now correctly points to your Render backend in production
    window.location.href = `${API_BASE_URL}/auth/login`;
  }, [navigate]);
  return <div><p>Redirecting to MyAnimeList...</p></div>;
};

function App() {
  return (
    <WatchlistProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/link-mal" element={<LinkMal />} />
          <Route path="/search-results" element={<SearchResultsPage />} />
          <Route path="/anime/:id" element={<AnimeDetailsPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/stats" element={<StatsPage />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </WatchlistProvider>
  );
}

export default App;