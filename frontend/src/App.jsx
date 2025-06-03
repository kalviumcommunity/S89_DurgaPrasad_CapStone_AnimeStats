import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/pages/LoginPage';
import SignupPage from './components/pages/SignupPage';
import DashboardPage from './components/pages/DashboardPage';
import MainContent from './MainContent';
import HomePage from './components/pages/HomePage';
import SearchResultsPage from './components/pages/SearchResultsPage'; // Import the new SearchResultsPage

const LinkMal = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // This is generally not the best practice for redirects within React Router.
    // For external redirects, window.location.href works.
    // For internal redirects, navigate('/some-internal-path') or a Link component is preferred.
    // If '/auth/login' is a backend route that initiates an external OAuth flow, this is okay.
    window.location.href = 'http://localhost:8080/auth/login';
  }, [navigate]); // navigate is part of the dependency array, though it typically doesn't change

  return (
    <div>
      <p>Redirecting to MyAnimeList...</p>
      {/* You can optionally add a loading spinner or message */}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/link-mal" element={<LinkMal />} />
        {/* NEW ROUTE: For displaying global search results */}
        <Route path="/search-results" element={<SearchResultsPage />} />
        <Route path="*" element={<div>404 - Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;