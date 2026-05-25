import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSearchGenre, setSelectedSearchGenre] = useState('All');
  const navigate = useNavigate();

  // The full list of genres
  const genres = [
    'All', 'Action', 'Adventure', 'Cars', 'Comedy', 'Dementia', 'Demons',
    'Mystery', 'Drama', 'Ecchi', 'Fantasy', 'Game', 'Historical', 'Horror',
    'Kids', 'Magic', 'Mecha', 'Music', 'Parody', 'Samurai', 'Romance',
    'School', 'Sci-Fi', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Shounen Ai',
    'Slice of Life', 'Space', 'Sports', 'Super Power', 'Vampire',
    'Harem', 'Supernatural', 'Military', 'Police', 'Psychological',
    'Thriller', 'Seinen', 'Josei'
  ];

  // Global Search
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
      console.log("Please enter a search term or select a genre.");
    }
  };

  // Back Button Function
  const handleBackClick = () => {
    navigate(-1); // Go to previous page
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <button className="back-button" onClick={handleBackClick}>←</button>
          <Link to="/home" className="logo">Anime</Link> {/* Logo link to /home */}
        </div>
        
        <div className="navbar-center-right-wrapper">
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
              {/* Dynamically generate options from the genres array */}
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {/* Special case for 'All' to be more descriptive */}
                  {genre === 'All' ? 'All Genres' : genre}
                </option>
              ))}
            </select>
            <button type="submit">Search</button>
          </form>

          <div className="navbar-right">
            <Link to="/stats">Stats</Link>
            <Link to="/watchlist">My Watchlist</Link>
          </div>
        </div>
        
      </div>
    </nav>
  );
}

export default Navbar;