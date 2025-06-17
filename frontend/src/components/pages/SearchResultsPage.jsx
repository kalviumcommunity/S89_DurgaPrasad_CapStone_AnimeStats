// src/components/pages/SearchResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../Navbar';
import '../HomePage.css';
import './SearchResultsPage.css';

function SearchResultsPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const genreFilter = searchParams.get('genre');

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query && (!genreFilter || genreFilter === 'All')) {
        setLoading(false);
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let apiUrl = '';

        if (query) {
          apiUrl = `/api/anime/search?limit=50&q=${encodeURIComponent(query)}`;
        } else if (genreFilter && genreFilter !== 'All') {
          apiUrl = `/api/anime/genre-based?genre=${encodeURIComponent(genreFilter)}`;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // --- REVERTING TO THE ORIGINAL, SIMPLER LOGIC ---
        // This was the accurate logic from your first version.
        // It does not perform the complex de-duplication.
        const results = data.data || data;
        setSearchResults(results);

      } catch (e) {
        console.error('Error fetching search results:', e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, genreFilter]);

  if (loading) {
    return (
      <div className="home-page">
        <Navbar />
        <div className="home-page-content">
          <div className="loading-message">Loading search results for "{query || genreFilter}"...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <Navbar />
        <div className="home-page-content">
          <div className="error-message">Error loading search results: {error.message}</div>
        </div>
      </div>
    );
  }

  const resultTitle =
    query && genreFilter && genreFilter !== 'All'
      ? `Search Results for "${query}" in "${genreFilter}"`
      : query
      ? `Search Results for "${query}"`
      : `Anime by Genre: "${genreFilter}"`;

  return (
    <div className="home-page">
      <Navbar />
      <div className="home-page-content">
        <h2 className="section-title">{resultTitle}</h2>
        {searchResults.length === 0 ? (
          <p>No anime found for "{query || genreFilter}". Please try a different search or filter.</p>
        ) : (
          <div className="anime-grid-all">
            {/* --- KEEPING THE CURRENT JSX STRUCTURE --- */}
            {searchResults.map((anime) => (
              <React.Fragment key={anime.id}>
                <Link to={`/anime/${anime.id}`} className="anime-card-link">
                   <div className="anime-card">
                      {anime.main_picture && (
                        <img 
                          src={typeof anime.main_picture === 'object' ? anime.main_picture.large || anime.main_picture.medium : anime.main_picture} 
                          alt={anime.title} 
                        />
                      )}
                      <div className="hover-info">
                        <h3>{anime.title}</h3>
                        {anime.mean && <p>Score: {anime.mean}</p>}
                      </div>
                   </div>
                </Link>

                {anime.related_anime && anime.related_anime.length > 0 && (
                  <div className="related-anime-section">
                    <h4>Related Anime</h4>
                    <div className="related-anime-grid">
                      {anime.related_anime.map((related) => (
                        <Link
                          to={`/anime/${related.id}`}
                          key={`${anime.id}-related-${related.id}`}
                          className="related-anime-card"
                        >
                          <div className="mini-card">
                            {related.main_picture && (
                              <img src={related.main_picture} alt={related.title} />
                            )}
                            <p>{related.title}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResultsPage;