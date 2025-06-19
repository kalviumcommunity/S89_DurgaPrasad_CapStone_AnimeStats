import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios'; // ✅ FIX #1: Imported axios for consistency
import Navbar from '../../Navbar';
import '../HomePage.css';
import './SearchResultsPage.css';

// ✅ FIX #2: Replaced the hardcoded URL with the single, reliable environment variable.
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
        let endpoint = '';
        let params = {};

        // ✅ FIX #3: Cleaner way to build the request with axios
        if (query) {
          endpoint = '/anime/search';
          params = { limit: 50, q: query };
        } else if (genreFilter && genreFilter !== 'All') {
          endpoint = '/anime/genre-based';
          params = { genre: genreFilter };
        }

        // Using axios, which will automatically use the global `withCredentials: true` setting
        const response = await axios.get(`${BASE_URL}${endpoint}`, { params });

        // axios automatically parses JSON and puts it in `response.data`
        const results = response.data.data || response.data;
        setSearchResults(results);

      } catch (e) {
        console.error('Error fetching search results:', e.response?.data || e.message);
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
            {searchResults.map((anime) => (
              <React.Fragment key={anime.id}>
                <Link to={`/anime/${anime.id}`} className="anime-card-link">
                  <div className="anime-card">
                    {anime.main_picture && (
                      <img
                        src={
                          typeof anime.main_picture === 'object'
                            ? anime.main_picture.large || anime.main_picture.medium
                            : anime.main_picture
                        }
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
