
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../Navbar';
import { useNavigate, Link } from 'react-router-dom';
import '../HomePage.css';


function HomePage() {
  const navigate = useNavigate();

  const [topAiring, setTopAiring] = useState([]);
  const [loadingAiring, setLoadingAiring] = useState(true);
  const [errorAiring, setErrorAiring] = useState(null);

  const [topRated, setTopRated] = useState([]);
  const [loadingRated, setLoadingRated] = useState(true);
  const [errorRated, setErrorRated] = useState(null);

  const [popularSeason, setPopularSeason] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [errorPopular, setErrorPopular] = useState(null);

  const [selectedSearchGenre, setSelectedSearchGenre] = useState('All');

  const genreCarouselRef = useRef(null);
  const topAiringCarouselRef = useRef(null);
  const topRatedCarouselRef = useRef(null);
  const popularSeasonCarouselRef = useRef(null);

  const [showGenreLeftArrow, setShowGenreLeftArrow] = useState(false);
  const [showGenreRightArrow, setShowGenreRightArrow] = useState(true);
  const [showAiringLeftArrow, setShowAiringLeftArrow] = useState(false);
  const [showAiringRightArrow, setShowAiringRightArrow] = useState(true);
  const [showRatedLeftArrow, setShowRatedLeftArrow] = useState(false);
  const [showRatedRightArrow, setShowRatedRightArrow] = useState(true);
  const [showPopularLeftArrow, setShowPopularLeftArrow] = useState(false);
  const [showPopularRightArrow, setShowPopularRightArrow] = useState(true);

  const genres = [
    'All', 'Action', 'Adventure', 'Cars', 'Comedy', 'Dementia', 'Demons',
    'Mystery', 'Drama', 'Ecchi', 'Fantasy', 'Game', 'Historical', 'Horror',
    'Kids', 'Magic', 'Mecha', 'Music', 'Parody', 'Samurai', 'Romance',
    'School', 'Sci-Fi', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Shounen Ai',
    'Slice of Life', 'Space', 'Sports', 'Super Power', 'Vampire',
    'Harem', 'Supernatural', 'Military', 'Police', 'Psychological',
    'Thriller', 'Seinen', 'Josei'
  ];

  const checkScrollPosition = (ref, setLeftArrow, setRightArrow) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      const isAtStart = scrollLeft < 10;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
      setLeftArrow(!isAtStart);
      setRightArrow(!isAtEnd);
    }
  };
  
  const handleScroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.9;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };
  
  // --- Data Fetching Hooks (Unchanged) ---
  useEffect(() => {
    const fetchTopAiring = async () => {
      try { setLoadingAiring(true); const res = await fetch('/api/anime/top-airing'); const data = await res.json(); setTopAiring(data); } 
      catch (e) { setErrorAiring(e); } finally { setLoadingAiring(false); }
    };
    fetchTopAiring();
  }, []);

  useEffect(() => {
    const fetchTopRated = async () => {
      try { setLoadingRated(true); const res = await fetch('/api/anime/top-rated'); const data = await res.json(); setTopRated(data); } 
      catch (e) { setErrorRated(e); } finally { setLoadingRated(false); }
    };
    fetchTopRated();
  }, []);

  useEffect(() => {
    const fetchPopular = async () => {
      try { setLoadingPopular(true); const res = await fetch('/api/anime/popular-season'); const data = await res.json(); setPopularSeason(data); }
      catch (e) { setErrorPopular(e); } finally { setLoadingPopular(false); }
    };
    fetchPopular();
  }, []);

  // --- THE CORRECTED ARROW LOGIC ---
  // Each useEffect now directly depends on its data array.
  
  useEffect(() => {
    const element = genreCarouselRef.current;
    if (!element) return;
    const handleCheck = () => checkScrollPosition(genreCarouselRef, setShowGenreLeftArrow, setShowGenreRightArrow);
    const timerId = setTimeout(handleCheck, 100);
    element.addEventListener('scroll', handleCheck);
    window.addEventListener('resize', handleCheck);
    return () => {
      clearTimeout(timerId);
      element.removeEventListener('scroll', handleCheck);
      window.removeEventListener('resize', handleCheck);
    };
  }, [genres]); // Depends on the static genres array

  useEffect(() => {
    const element = topAiringCarouselRef.current;
    if (!element || topAiring.length === 0) return;
    const handleCheck = () => checkScrollPosition(topAiringCarouselRef, setShowAiringLeftArrow, setShowAiringRightArrow);
    const timerId = setTimeout(handleCheck, 100);
    element.addEventListener('scroll', handleCheck);
    window.addEventListener('resize', handleCheck);
    return () => {
      clearTimeout(timerId);
      element.removeEventListener('scroll', handleCheck);
      window.removeEventListener('resize', handleCheck);
    };
  }, [topAiring]); // Dependency is the data itself

  useEffect(() => {
    const element = topRatedCarouselRef.current;
    if (!element || topRated.length === 0) return;
    const handleCheck = () => checkScrollPosition(topRatedCarouselRef, setShowRatedLeftArrow, setShowRatedRightArrow);
    const timerId = setTimeout(handleCheck, 100);
    element.addEventListener('scroll', handleCheck);
    window.addEventListener('resize', handleCheck);
    return () => {
      clearTimeout(timerId);
      element.removeEventListener('scroll', handleCheck);
      window.removeEventListener('resize', handleCheck);
    };
  }, [topRated]); // Dependency is the data itself

  useEffect(() => {
    const element = popularSeasonCarouselRef.current;
    if (!element || popularSeason.length === 0) return;
    const handleCheck = () => checkScrollPosition(popularSeasonCarouselRef, setShowPopularLeftArrow, setShowPopularRightArrow);
    const timerId = setTimeout(handleCheck, 100);
    element.addEventListener('scroll', handleCheck);
    window.addEventListener('resize', handleCheck);
    return () => {
      clearTimeout(timerId);
      element.removeEventListener('scroll', handleCheck);
      window.removeEventListener('resize', handleCheck);
    };
  }, [popularSeason]); // Dependency is the data itself

  const handleGenreTagClick = (genre) => {
    navigate(`/search-results?genre=${encodeURIComponent(genre)}`);
    setSelectedSearchGenre(genre);
  };
  
  if (loadingAiring || loadingRated || loadingPopular) {
    return (
      <div className="home-page">
        <Navbar />
        <div className="home-page-content" style={{ textAlign: 'center', paddingTop: '50px' }}>
          <div className="loading-message">Loading anime data...</div>
        </div>
      </div>
    );
  }

  if (errorAiring || errorRated || errorPopular) {
    return (
      <div className="home-page">
        <Navbar />
        <div className="home-page-content" style={{ textAlign: 'center', paddingTop: '50px' }}>
          <div className="error-message" style={{ color: '#ff4d4d' }}>
            Error loading anime data: {errorAiring?.message || errorRated?.message || errorPopular?.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Navbar />
      <div className="home-page-content">
        {/* Genre Filter Section */}
        <section className="genre-filter">
          <h2 className="section-title">Browse by Genre:</h2>
          <div className="section-container">
            <button
              className="carousel-arrow left"
              onClick={() => handleScroll(genreCarouselRef, 'left')}
              aria-label="Scroll genres left"
              disabled={!showGenreLeftArrow}
            >
              ‹
            </button>
            <div className="genre-buttons-wrapper">
              <div className="genre-buttons" ref={genreCarouselRef}>
                {genres.map((genre) => (
                  <button
                    key={`genre-${genre}`}
                    className={`genre-button ${selectedSearchGenre === genre ? 'active' : ''}`}
                    onClick={() => handleGenreTagClick(genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="carousel-arrow right"
              onClick={() => handleScroll(genreCarouselRef, 'right')}
              aria-label="Scroll genres right"
              disabled={!showGenreRightArrow}
            >
              ›
            </button>
          </div>
        </section>

        {/* Top Airing Section */}
        <section className="top-airing">
          <h2 className="section-title">Top Airing Anime</h2>
          <div className="section-container">
            <button className="carousel-arrow left" onClick={() => handleScroll(topAiringCarouselRef, 'left')} aria-label="Scroll left" disabled={!showAiringLeftArrow}>‹</button>
            <div className="carousel-fade-wrapper">
              <div className="anime-carousel" ref={topAiringCarouselRef}>
                {topAiring.map((anime) => (
                  <Link to={`/anime/${anime.id}`} key={anime.id} className="anime-card-link">
                    <div className="anime-card">
                      {anime.main_picture && <img src={anime.main_picture} alt={anime.title} />}
                      <div className="hover-info"><h3>{anime.title}</h3>{anime.mean && <p>Score: {anime.mean}</p>}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="fade-overlay fade-left" style={{ opacity: showAiringLeftArrow ? 1 : 0 }} />
              <div className="fade-overlay fade-right" style={{ opacity: showAiringRightArrow ? 1 : 0 }}/>
            </div>
            <button className="carousel-arrow right" onClick={() => handleScroll(topAiringCarouselRef, 'right')} aria-label="Scroll right" disabled={!showAiringRightArrow}>›</button>
          </div>
        </section>

        {/* Top Rated Section */}
        <section className="top-rated">
          <h2 className="section-title">Top Rated Anime</h2>
          <div className="section-container">
            <button className="carousel-arrow left" onClick={() => handleScroll(topRatedCarouselRef, 'left')} aria-label="Scroll left" disabled={!showRatedLeftArrow}>‹</button>
            <div className="carousel-fade-wrapper">
              <div className="anime-carousel" ref={topRatedCarouselRef}>
                {topRated.map((anime) => (
                  <Link to={`/anime/${anime.id}`} key={anime.id} className="anime-card-link">
                    <div className="anime-card">
                      {anime.main_picture && <img src={anime.main_picture} alt={anime.title} />}
                      <div className="hover-info"><h3>{anime.title}</h3>{anime.mean && <p>Score: {anime.mean}</p>}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="fade-overlay fade-left" style={{ opacity: showRatedLeftArrow ? 1 : 0 }} />
              <div className="fade-overlay fade-right" style={{ opacity: showRatedRightArrow ? 1 : 0 }}/>
            </div>
            <button className="carousel-arrow right" onClick={() => handleScroll(topRatedCarouselRef, 'right')} aria-label="Scroll right" disabled={!showRatedRightArrow}>›</button>
          </div>
        </section>

        {/* Popular This Season Section */}
        <section className="popular-season">
          <h2 className="section-title">Popular This Season</h2>
          <div className="section-container">
            <button className="carousel-arrow left" onClick={() => handleScroll(popularSeasonCarouselRef, 'left')} aria-label="Scroll left" disabled={!showPopularLeftArrow}>‹</button>
            <div className="carousel-fade-wrapper">
              <div className="anime-carousel" ref={popularSeasonCarouselRef}>
                {popularSeason.map((anime) => (
                  <Link to={`/anime/${anime.id}`} key={anime.id} className="anime-card-link">
                    <div className="anime-card">
                      {anime.main_picture && <img src={anime.main_picture} alt={anime.title} />}
                      <div className="hover-info"><h3>{anime.title}</h3>{anime.mean && <p>Score: {anime.mean}</p>}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="fade-overlay fade-left" style={{ opacity: showPopularLeftArrow ? 1 : 0 }} />
              <div className="fade-overlay fade-right" style={{ opacity: showPopularRightArrow ? 1 : 0 }}/>
            </div>
            <button className="carousel-arrow right" onClick={() => handleScroll(popularSeasonCarouselRef, 'right')} aria-label="Scroll right" disabled={!showPopularRightArrow}>›</button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;