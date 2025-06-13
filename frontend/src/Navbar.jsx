import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <button className="back-button">←</button>
          <h1 className="logo">TSD</h1>
        </div>
        <div className="navbar-right">
          <Link to="/stats">Stats</Link>
          <Link to="/watchlist">My Watchlist</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
