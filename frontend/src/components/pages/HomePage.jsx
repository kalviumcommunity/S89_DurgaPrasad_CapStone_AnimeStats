
// src/components/pages/HomePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../Navbar';
import { useNavigate, Link } from 'react-router-dom';

import '../HomePage.css'; // This CSS file is crucial for the hover effect styling!

function HomePage() {
  const navigate = useNavigate();

  // State for Top Airing Anime section
  const [topAiring, setTopAiring] = useState([]);
  const [loadingAiring, setLoadingAiring] = useState(true);
  const [errorAiring, setErrorAiring] = useState(null);

  // State for Top Rated Anime section
  const [topRated, setTopRated] = useState([]);
  const [loadingRated, setLoadingRated] = useState(true);
  const [errorRated, setErrorRated] = useState(null);

  // State for Popular This Season Anime section
  const [popularSeason, setPopularSeason] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [errorPopular, setErrorPopular] = useState(null);

  // State for the global search bar input
  const [searchTerm, setSearchTerm] = useState('');
  // State for the genre filter dropdown *within the global search bar*
  const [selectedSearchGenre, setSelectedSearchGenre] = useState('All'); 

  // Ref for the TOP AIRING anime carousel
  const topAiringCarouselRef = useRef(null);
  // State to control visibility of fade effects for the TOP AIRING carousel
  const [showAiringLeftFade, setShowAiringLeftFade] = useState(false);
  const [showAiringRightFade, setShowAiringRightFade] = useState(true);

  // Ref for the TOP RATED anime carousel
  const topRatedCarouselRef = useRef(null);
  // State to control visibility of fade effects for the TOP RATED carousel
  const [showRatedLeftFade, setShowRatedLeftFade] = useState(false);
  const [showRatedRightFade, setShowRatedRightFade] = useState(true);

  // Ref for the Popular This Season carousel
  const popularSeasonCarouselRef = useRef(null);
  // State to control visibility of fade effects for the Popular This Season carousel
  const [showPopularLeftFade, setShowPopularLeftFade] = useState(false);
  const [showPopularRightFade, setShowPopularRightFade] = useState(true);

  // Comprehensive list of genres for filter buttons
  const genres = [
    'All', 'Action', 'Adventure', 'Cars', 'Comedy', 'Dementia', 'Demons',
    'Mystery', 'Drama', 'Ecchi', 'Fantasy', 'Game', 'Historical', 'Horror',
    'Kids', 'Magic', 'Mecha', 'Music', 'Parody', 'Samurai', 'Romance',
    'School', 'Sci-Fi', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Shounen Ai',
    'Slice of Life', 'Space', 'Sports', 'Super Power', 'Vampire',
    'Harem', 'Supernatural', 'Military', 'Police', 'Psychological',
    'Thriller', 'Seinen', 'Josei'
  ]; 


  const checkAiringScrollPosition = () => {
    if (topAiringCarouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = topAiringCarouselRef.current;
      const scrollThreshold = 10;
      setShowAiringLeftFade(scrollLeft > scrollThreshold);
      setShowAiringRightFade(scrollLeft + clientWidth < scrollWidth - scrollThreshold);
    }
  };

  const checkRatedScrollPosition = () => {
    if (topRatedCarouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = topRatedCarouselRef.current;
      const scrollThreshold = 10;
      setShowRatedLeftFade(scrollLeft > scrollThreshold);
      setShowRatedRightFade(scrollLeft + clientWidth < scrollWidth - scrollThreshold);
    }
  };

  const checkPopularScrollPosition = () => {
    if (popularSeasonCarouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = popularSeasonCarouselRef.current;
      const scrollThreshold = 10;
      setShowPopularLeftFade(scrollLeft > scrollThreshold);
      setShowPopularRightFade(scrollLeft + clientWidth < scrollWidth - scrollThreshold);
    }
  };


  // --- useEffect hooks for attaching and cleaning up scroll listeners ---
  useEffect(() => {
    const carouselElement = topAiringCarouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener('scroll', checkAiringScrollPosition);
      checkAiringScrollPosition(); 
    }
    return () => {
      if (carouselElement) {
        carouselElement.removeEventListener('scroll', checkAiringScrollPosition);
      }
    };
  }, [topAiring]); 

  useEffect(() => {
    const carouselElement = topRatedCarouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener('scroll', checkRatedScrollPosition);
      checkRatedScrollPosition(); 
    }
    return () => {
      if (carouselElement) {
        carouselElement.removeEventListener('scroll', checkRatedScrollPosition);
      }
    };
  }, [topRated]); 

  useEffect(() => {
    const carouselElement = popularSeasonCarouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener('scroll', checkPopularScrollPosition);
      checkPopularScrollPosition(); 
    }
    return () => {
      if (carouselElement) {
        carouselElement.removeEventListener('scroll', checkPopularScrollPosition);
      }
    };
  }, [popularSeason]); 


  // --- Handle Window Resize to Re-check Scroll Fades for all carousels ---
  useEffect(() => {
    const handleResize = () => {
      checkAiringScrollPosition();
      checkRatedScrollPosition();
      checkPopularScrollPosition();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); 


  // --- Fetching Logic for Anime Sections (carousels on homepage) ---

  // Top Airing Anime fetch
  useEffect(() => {
    const fetchTopAiringAnime = async () => {
      setLoadingAiring(true);
      setErrorAiring(null);
      try {
        const response = await fetch('/api/anime/top-airing');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTopAiring(data);
      } catch (e) {
        setErrorAiring(e);
        console.error('Error fetching top airing anime:', e);
      } finally {
        setLoadingAiring(false);
      }
    };
    fetchTopAiringAnime();
  }, []); 

  // Top Rated Anime fetch
  useEffect(() => {
    const fetchTopRatedAnime = async () => {
      setLoadingRated(true);
      setErrorRated(null);
      try {
        const response = await fetch('/api/anime/top-rated');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTopRated(data);
      } catch (e) {
        setErrorRated(e);
        console.error('Error fetching top rated anime:', e);
      } finally {
        setLoadingRated(false);
      }
    };
    fetchTopRatedAnime();
  }, []); 

  // Popular This Season Anime fetch
  useEffect(() => {
    const fetchPopularSeasonAnime = async () => {
      setLoadingPopular(true);
      setErrorPopular(null);
      try {
        const response = await fetch('/api/anime/popular-season');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPopularSeason(data);
      } catch (e) {
        setErrorPopular(e);
        console.error('Error fetching popular season anime:', e);
      } finally {
        setLoadingPopular(false);
      }
    };
    fetchPopularSeasonAnime();
  }, []); 


  // --- Global Search Functionality (triggered by search bar or genre dropdown) ---
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

  // --- Genre Tag Click Functionality (direct navigation to search results) ---
  const handleGenreTagClick = (genre) => {
    navigate(`/search-results?genre=${encodeURIComponent(genre)}`);
    setSearchTerm(''); 
    setSelectedSearchGenre('All'); 
  };


  // --- Combined Loading/Error Rendering ---
  if (loadingAiring || loadingRated || loadingPopular) {
    return (
      <div className="home-page">
        <Navbar />
        <div className="home-page-content">
          <div className="loading-message">Loading anime data...</div>
        </div>
      </div>
    );
  }

  if (errorAiring || errorRated || errorPopular) {
    return (
      <div className="home-page">
        <Navbar />
        <div className="home-page-content">
          <div className="error-message">Error loading anime data: {errorAiring?.message || errorRated?.message || errorPopular?.message}</div>
        </div>
      </div>
    );
  }

  // --- Main Component Render ---
  return (
    <div className="home-page">
      <Navbar />

      <div className="home-page-content">
        {/* Global Search Bar (behaves as a form) */}
        <form onSubmit={handleSearchSubmit} className="search-bar-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search all anime..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={selectedSearchGenre}
            onChange={(e) => setSelectedSearchGenre(e.target.value)}
            className="genre-select"
          >
            {genres.map(genre => (
              <option key={`search-genre-${genre}`} value={genre}>{genre}</option>
            ))}
          </select>
          <button type="submit" className="search-button">Search</button>
        </form>

        {/* Genre Filter Section for direct Browse by genre */}
        <section className="genre-filter">
          <h2 className="section-title">Browse by Genre:</h2>
          <div className="genre-buttons">
            {genres.map(genre => (
              <button
                key={`genre-tag-${genre}`}
                className={`genre-button ${selectedSearchGenre === genre ? 'active' : ''}`} 
                onClick={() => handleGenreTagClick(genre)} 
              >
                {genre}
              </button>
            ))}
          </div>
        </section>

        {/* Top Airing Anime Section */}
        <section className="top-airing">
          <h2 className="section-title">Top Airing Anime</h2>
          <div className="carousel-fade-wrapper">
            <div className="anime-carousel" ref={topAiringCarouselRef}>
              {topAiring.map((anime) => (
                // Wrapped the entire anime-card with Link for navigation
                <Link to={`/anime/${anime.id}`} key={anime.id} className="anime-card-link">
                  <div className="anime-card">
                    {anime.main_picture && <img src={anime.main_picture} alt={anime.title} />}
                    {/* Re-introduced hover-info structure as per your commented code */}
                    <div className="hover-info">
                      <h3>{anime.title}</h3>
                      {anime.mean && <p>Score: {anime.mean}</p>}
                      {/* You can add synopsis here if you want it on hover */}
                      {/* {anime.synopsis && <p className="synopsis-preview">{anime.synopsis}</p>} */}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {showAiringLeftFade && <div className="fade-overlay fade-left"></div>}
            {showAiringRightFade && <div className="fade-overlay fade-right"></div>}
          </div>
          <Link to="/browse?category=top-airing" className="view-more-button">View More →</Link>
        </section>

        {/* Top Rated Anime Section */}
        <section className="top-rated">
          <h2 className="section-title">Top Rated Anime</h2>
          <div className="carousel-fade-wrapper">
            <div className="anime-carousel" ref={topRatedCarouselRef}> 
              {topRated.map((anime) => (
                // Wrapped the entire anime-card with Link for navigation
                <Link to={`/anime/${anime.id}`} key={anime.id} className="anime-card-link">
                  <div className="anime-card">
                    {anime.main_picture && <img src={anime.main_picture} alt={anime.title} />}
                    {/* Re-introduced hover-info structure as per your commented code */}
                    <div className="hover-info">
                        <h3>{anime.title}</h3>
                        {anime.mean && <p>Score: {anime.mean}</p>}
                        {/* You can add synopsis here if you want it on hover */}
                        {/* {anime.synopsis && <p className="synopsis-preview">{anime.synopsis}</p>} */}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {showRatedLeftFade && <div className="fade-overlay fade-left"></div>}
            {showRatedRightFade && <div className="fade-overlay fade-right"></div>}
          </div>
          <Link to="/browse?category=top-rated" className="view-more-button">View More →</Link>
        </section>

        {/* Popular This Season Section */}
        <section className="popular-season">
          <h2 className="section-title">Popular This Season</h2>
          <div className="carousel-fade-wrapper">
            <div className="anime-carousel" ref={popularSeasonCarouselRef}>
              {popularSeason.map((anime) => (
                // Wrapped the entire anime-card with Link for navigation
                <Link to={`/anime/${anime.id}`} key={anime.id} className="anime-card-link">
                  <div className="anime-card">
                    {anime.main_picture && <img src={anime.main_picture} alt={anime.title} />}
                    {/* Re-introduced hover-info structure as per your commented code */}
                    <div className="hover-info">
                      <h3>{anime.title}</h3>
                      {anime.mean && <p>Score: {anime.mean}</p>}
                      {/* You can add synopsis here if you want it on hover */}
                      {/* {anime.synopsis && <p className="synopsis-preview">{anime.synopsis}</p>} */}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {showPopularLeftFade && <div className="fade-overlay fade-left"></div>}
            {showPopularRightFade && <div className="fade-overlay fade-right"></div>}
          </div>
          <Link to="/browse?category=popular-season" className="view-more-button">View More →</Link>
        </section>

      </div>
    </div>
  );
}

export default HomePage;