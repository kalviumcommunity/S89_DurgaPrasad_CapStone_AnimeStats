// src/components/pages/SearchResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // Hook to access query parameters
import Navbar from '../../Navbar';
import '../HomePage.css'; // Reuse existing anime-card styles

function SearchResultsPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams(); // Hook to access URL query parameters
  const query = searchParams.get('q'); // Get the 'q' (query) parameter from the URL
  const genreFilter = searchParams.get('genre'); // Get the 'genre' parameter from the URL

  useEffect(() => {
    const fetchSearchResults = async () => {
      // Only fetch if there's a query or a genre filter
      if (!query && (!genreFilter || genreFilter === 'All')) {
        setLoading(false);
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let apiUrl = `/api/anime/search?limit=50`; // Start with a reasonable limit
        if (query) {
          apiUrl += `&q=${encodeURIComponent(query)}`;
        }
        if (genreFilter && genreFilter !== 'All') {
          apiUrl += `&genre=${encodeURIComponent(genreFilter)}`;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSearchResults(data.data); // Assuming your backend sends { data: [...] }
      } catch (e) {
        console.error('Error fetching search results:', e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, genreFilter]); // Re-run effect when query or genre filter changes in URL

  if (loading) {
    return (
      <div className="home-page"> {/* Reuse home-page styles for general layout */}
        <Navbar />
        <div className="home-page-content">
          <div>Loading search results for "{query || genreFilter}"...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <Navbar />
        <div className="home-page-content">
          <div>Error loading search results: {error.message}</div>
        </div>
      </div>
    );
  }

  const resultTitle = query && genreFilter && genreFilter !== 'All'
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
          // Reusing the anime-grid-all class from HomePage.css for a responsive grid
          <div className="anime-grid-all">
            {searchResults.map((anime) => (
              <div className="anime-card" key={anime.id}>
                {anime.main_picture && <img src={anime.main_picture} alt={anime.title} />}
                <div className="hover-info">
                  <h3>{anime.title}</h3>
                  {anime.mean && <p>Score: {anime.mean}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResultsPage;