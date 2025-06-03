// src/components/pages/HomePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../Navbar';
import { useNavigate, Link } from 'react-router-dom'; // Import useNavigate and Link

import '../HomePage.css'; // Assuming this path is correct

function HomePage() {
  const navigate = useNavigate(); // Hook for programmatic navigation

  // State for Top Airing Anime section
  const [topAiring, setTopAiring] = useState([]);
  const [loadingAiring, setLoadingAiring] = useState(true);
  const [errorAiring, setErrorAiring] = useState(null);

  // State for Top Rated Anime section
  const [topRated, setTopRated] = useState([]);
  const [loadingRated, setLoadingRated] = useState(true); // FIX: Changed from = true to useState(true)
  const [errorRated, setErrorRated] = useState(null);    // FIX: Changed from = null to useState(null)

  // NEW: State for Popular This Season Anime section
  const [popularSeason, setPopularSeason] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true); // FIX: Changed from = true to useState(true)
  const [errorPopular, setErrorPopular] = useState(null);    // FIX: Changed from = null to useState(null)

  // State for the global search bar input
  const [searchTerm, setSearchTerm] = useState('');
  // State for the genre filter buttons on the homepage (affects global search)
  const [selectedGenre, setSelectedGenre] = useState('All');

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

  // NEW: Ref for the Popular This Season carousel
  const popularSeasonCarouselRef = useRef(null);
  // NEW: State to control visibility of fade effects for the Popular This Season carousel
  const [showPopularLeftFade, setShowPopularLeftFade] = useState(false);
  const [showPopularRightFade, setShowPopularRightFade] = useState(true);


  // --- Carousel Scroll Position Check Functions ---
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

  // NEW: Function to check scroll position and update fade states for Popular This Season
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
      checkAiringScrollPosition(); // Initial check on mount
    }
    return () => {
      if (carouselElement) {
        carouselElement.removeEventListener('scroll', checkAiringScrollPosition);
      }
    };
  }, [topAiring]); // Re-check after data loads

  useEffect(() => {
    const carouselElement = topRatedCarouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener('scroll', checkRatedScrollPosition);
      checkRatedScrollPosition(); // Initial check on mount
    }
    return () => {
      if (carouselElement) {
        carouselElement.removeEventListener('scroll', checkRatedScrollPosition);
      }
    };
  }, [topRated]); // Re-check after data loads

  // NEW: Attach and clean up scroll event listener for Popular This Season carousel
  useEffect(() => {
    const carouselElement = popularSeasonCarouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener('scroll', checkPopularScrollPosition);
      checkPopularScrollPosition(); // Initial check on mount
    }
    return () => {
      if (carouselElement) {
        carouselElement.removeEventListener('scroll', checkPopularScrollPosition);
      }
    };
  }, [popularSeason]); // Re-check after data loads


  // --- Handle Window Resize to Re-check Scroll Fades for all carousels ---
  useEffect(() => {
    const handleResize = () => {
      checkAiringScrollPosition();
      checkRatedScrollPosition();
      checkPopularScrollPosition(); // NEW: Call for popular season also
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Runs once on mount and cleans up on unmount


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
  }, []); // Empty dependency array means this runs once on mount

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
  }, []); // Empty dependency array means this runs once on mount

  // NEW: Popular This Season Anime fetch
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
  }, []); // Empty dependency array means this runs once on mount


  // --- Global Search Functionality ---
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission and page reload
    // Construct URL with query and genre (if not 'All')
    let queryString = '';
    if (searchTerm.trim()) {
      queryString += `q=${encodeURIComponent(searchTerm.trim())}`;
    }
    if (selectedGenre && selectedGenre !== 'All') {
      queryString += `${queryString ? '&' : ''}genre=${encodeURIComponent(selectedGenre)}`;
    }

    if (queryString) { // Only navigate if there's a search term or a specific genre
      navigate(`/search-results?${queryString}`);
      setSearchTerm(''); // Clear search bar after navigating
      setSelectedGenre('All'); // Reset genre filter for next search
    } else {
        // Optionally, provide feedback to the user if they try to search empty
        console.log("Please enter a search term or select a genre.");
    }
  };


  // --- Combined Loading/Error Rendering ---
  if (loadingAiring || loadingRated || loadingPopular) { // Include popular season loading
    return (
      <div className="home-page">
        <Navbar />
        <div className="home-page-content">
          <div>Loading anime data...</div>
        </div>
      </div>
    );
  }

  if (errorAiring || errorRated || errorPopular) { // Include popular season error
    return (
      <div className="home-page">
        <Navbar />
        <div className="home-page-content">
          <div>Error loading anime data: {errorAiring?.message || errorRated?.message || errorPopular?.message}</div>
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
          {/* A hidden submit button allows pressing Enter to submit the form */}
          <button type="submit" style={{ display: 'none' }}></button>
        </form>

        {/* Genre Filter Section for Global Search */}
        {/* These genre buttons will now ONLY set the state for the global search when submitted */}
        <section className="genre-filter">
          <h2 className="section-title">Filter Global Search by Genre:</h2>
          <div className="genre-buttons">
            {/* Added active class for styling the selected button */}
            {['All', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Sci-Fi', 'Romance', 'Thriller', 'Horror', 'Slice of Life', 'Sports', 'Mecha', 'Psychological', 'Supernatural'].map(genre => (
              <button
                key={genre}
                className={`genre-button ${selectedGenre === genre ? 'active' : ''}`}
                onClick={() => setSelectedGenre(genre)}
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
                <div className="anime-card" key={anime.id}>
                  {anime.main_picture && <img src={anime.main_picture} alt={anime.title} />}
                  <div className="hover-info">
                    <h3>{anime.title}</h3>
                    {/* Add other info like synopsis/score if desired on hover */}
                  </div>
                </div>
              ))}
            </div>
            {showAiringLeftFade && <div className="fade-overlay fade-left"></div>}
            {showAiringRightFade && <div className="fade-overlay fade-right"></div>}
          </div>
          {/* Link to a future browse page for top airing (with pre-applied filter) */}
          <Link to="/browse?category=top-airing" className="view-more-button">View More →</Link>
        </section>

        {/* Top Rated Anime Section */}
        <section className="top-rated">
          <h2 className="section-title">Top Rated Anime</h2>
          <div className="carousel-fade-wrapper">
            <div className="anime-grid" ref={topRatedCarouselRef}> {/* Using anime-grid for top-rated, could be anime-carousel too */}
              {topRated.map((anime) => (
                <div className="anime-card" key={anime.id}>
                  {anime.main_picture && <img src={anime.main_picture} alt={anime.title} />}
                  <div className="hover-info">
                      <h3>{anime.title}</h3>
                      {anime.mean && <p>Score: {anime.mean}</p>}
                  </div>
                </div>
              ))}
            </div>
            {showRatedLeftFade && <div className="fade-overlay fade-left"></div>}
            {showRatedRightFade && <div className="fade-overlay fade-right"></div>}
          </div>
          {/* Link to a future browse page for top rated (with pre-applied filter) */}
          <Link to="/browse?category=top-rated" className="view-more-button">View More →</Link>
        </section>

        {/* NEW: Popular This Season Section */}
        <section className="popular-season">
          <h2 className="section-title">Popular This Season</h2>
          <div className="carousel-fade-wrapper">
            <div className="anime-carousel" ref={popularSeasonCarouselRef}>
              {popularSeason.map((anime) => (
                <div className="anime-card" key={anime.id}>
                  {anime.main_picture && <img src={anime.main_picture} alt={anime.title} />}
                  <div className="hover-info">
                    <h3>{anime.title}</h3>
                    {anime.mean && <p>Score: {anime.mean}</p>}
                  </div>
                </div>
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