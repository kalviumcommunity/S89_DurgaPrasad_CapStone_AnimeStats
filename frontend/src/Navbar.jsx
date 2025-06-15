import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSearchGenre, setSelectedSearchGenre] = useState('All');
  const navigate = useNavigate();

  // --- Global Search Functionality ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    let queryString = '';
    if (searchTerm.trim()) {
      queryString += `q=${encodeURIComponent(searchTerm.trim())}`;
    }
    if (selectedSearchGenre && selectedSearchGenre !== 'All') {
      queryString += `${queryString ? '&' : ''}genre=${encodeURIComponent(selectedSearchGenre)}`;
    }

    if (queryString) {
      navigate(`/search-results?${queryString}`);
      setSearchTerm('');
      setSelectedSearchGenre('All');
    } else {
      console.log("Please enter a search term or select a genre from the dropdown.");
    }
  };

  // --- Genre Tag Click Functionality ---
  const handleGenreTagClick = (genre) => {
    navigate(`/search-results?genre=${encodeURIComponent(genre)}`);
    setSearchTerm('');
    setSelectedSearchGenre('All');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <button className="back-button">←</button>
          <h1 className="logo">TSD</h1>
        </div>

        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search anime..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={selectedSearchGenre}
            onChange={(e) => setSelectedSearchGenre(e.target.value)}
          >
            <option value="All">All Genres</option>
            <option value="Action">Action</option>
            <option value="Adventure">Adventure</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Romance">Romance</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Supernatural">Supernatural</option>
            {/* Add more genres if needed */}
          </select>
          <button type="submit">Search</button>
        </form>

        <div className="navbar-right">
          <Link to="/stats">Stats</Link>
          <Link to="/watchlist">My Watchlist</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
