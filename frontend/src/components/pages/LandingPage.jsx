// src/components/pages/LandingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // We will create this CSS file next

const LandingPage = () => {
  return (
    <div className="landing-page-container">
      <div className="landing-content">
        <h1 className="landing-title">Welcome to TSD Anime</h1>
        <p className="landing-subtitle">
          Track, discover, and share your favorite anime. Your next great watch awaits.
        </p>
        <div className="landing-buttons">
          <Link to="/login" className="landing-btn login-btn">Login</Link>
          <Link to="/signup" className="landing-btn signup-btn">Sign Up</Link>
        </div>
      </div>
      {/* Optional: Add a subtle background image or effect */}
      <div className="landing-background-overlay"></div>
    </div>
  );
};

export default LandingPage;

