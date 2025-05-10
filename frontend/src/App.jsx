import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/pages/LoginPage';
import DashboardPage from './components/pages/DashboardPage';
import MainContent from './MainContent';

const LinkMal = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to your backend's /auth/login endpoint
    window.location.href = 'http://localhost:8080/auth/login';
  }, [navigate]);

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/link-mal" element={<LinkMal />} /> {/* Define the new route */}
        <Route path="*" element={<div>404 - Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;