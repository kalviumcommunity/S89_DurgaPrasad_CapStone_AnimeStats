


import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/pages/LoginPage';
import SignupPage from './components/pages/SignupPage';
import DashboardPage from './components/pages/DashboardPage';
import MainContent from './MainContent';
import HomePage from './components/pages/HomePage';
import SearchResultsPage from './components/pages/SearchResultsPage';
import AnimeDetailsPage from './components/pages/AnimeDetailsPage';
import WatchlistPage from './components/pages/WatchlistPage';
import { WatchlistProvider } from './WatchlistContext.jsx'; 
import StatsPage from './components/pages/StatsPage';


const LinkMal = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.location.href = 'http://localhost:8080/auth/login';
  }, [navigate]);

  return (
    <div>
      <p>Redirecting to MyAnimeList...</p>
    </div>
  );
};

function App() {
  return (
    <WatchlistProvider> {/* Wrap BrowserRouter with WatchlistProvider */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/link-mal" element={<LinkMal />} />
          <Route path="/search-results" element={<SearchResultsPage />} />
          <Route path="/anime/:id" element={<AnimeDetailsPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="*" element={<div>404 - Page not found</div>} />
        </Routes>
      </BrowserRouter>
    </WatchlistProvider>
  );
}

export default App;