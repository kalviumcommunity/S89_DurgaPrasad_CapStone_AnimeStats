import React, { useState, useEffect } from 'react';
import Navbar from '../../Navbar';
import '../HomePage.css';

function HomePage() {
  const [topAiring, setTopAiring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopAiringAnime = async () => {
      try {
        const response = await fetch('/api/anime/top-airing');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTopAiring(data);
        setLoading(false);
      } catch (e) {
        setError(e);
        setLoading(false);
        console.error('Error fetching top airing anime:', e);
      }
    };

    fetchTopAiringAnime();
  }, []);

  if (loading) {
    return <div>Loading top airing anime...</div>;
  }

  if (error) {
    return <div>Error loading top airing anime: {error.message}</div>;
  }

  return (
    <div className="home-page">
      <Navbar />

      <div className="home-page-content">
        <div className="search-bar-container">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search an anime, and more" />
        </div>

        <section className="genre-filter">
          <h2 className="genre-title">Genre</h2>
          <div className="genre-buttons">
            <button className="genre-button action">Action</button>
            <button className="genre-button adventure">Adventure</button>
            <button className="genre-button comedy">Comedy</button>
            <button className="genre-button drama">Drama</button>
            <button className="genre-button fantasy">Fantasy</button>
            <button className="genre-button more">→</button>
          </div>
        </section>

        <section className="top-airing">
          <h2 className="section-title">Top Airing Anime</h2>
          <div className="anime-carousel">
            {topAiring.map((anime) => (
              <div className="anime-card" key={anime.id}>
                {anime.main_picture && <img src={anime.main_picture} alt={anime.title} />}
                <div className="anime-title">{anime.title}</div>
                <div className="hover-info">
                  <h3>{anime.title}</h3>
                  <p>{anime.synopsis}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="view-more-button">→</button>
        </section>

        <section className="top-rated">
          <h2 className="section-title">Top Rated Anime</h2>
          <div className="anime-grid">
            {/* ... Top Rated Anime */}
          </div>
          <button className="view-more-button">→</button>
        </section>
      </div>
    </div>
  );
}

export default HomePage;