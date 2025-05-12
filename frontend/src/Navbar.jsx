
import React from 'react';
import './Navbar.css'; // Import your Navbar CSS file

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button className="back-button">←</button>
        <h1 className="logo">ANIPULSE</h1>
        <div className="navbar-links">
          <a href="/news">News</a>
          <a href="/stats">Stats</a>
          <button className="user-icon">👤</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;