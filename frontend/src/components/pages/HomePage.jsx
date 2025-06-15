// src/components/pages/HomePage.jsx

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

  const topAiringCarouselRef = useRef(null);
  const topRatedCarouselRef = useRef(null);
  const popularSeasonCarouselRef = useRef(null);

  const [showAiringLeftFade, setShowAiringLeftFade] = useState(false);
  const [showAiringRightFade, setShowAiringRightFade] = useState(true);
  const [showRatedLeftFade, setShowRatedLeftFade] = useState(false);
  const [showRatedRightFade, setShowRatedRightFade] = useState(true);
  const [showPopularLeftFade, setShowPopularLeftFade] = useState(false);
  const [showPopularRightFade, setShowPopularRightFade] = useState(true);

  const genres = [
    'All', 'Action', 'Adventure', 'Cars', 'Comedy', 'Dementia', 'Demons',
    'Mystery', 'Drama', 'Ecchi', 'Fantasy', 'Game', 'Historical', 'Horror',
    'Kids', 'Magic', 'Mecha', 'Music', 'Parody', 'Samurai', 'Romance',
    'School', 'Sci-Fi', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Shounen Ai',
    'Slice of Life', 'Space', 'Sports', 'Super Power', 'Vampire',
    'Harem', 'Supernatural', 'Military', 'Police', 'Psychological',
    'Thriller', 'Seinen', 'Josei'
  ];

  const checkScrollPosition = (ref, setLeftFade, setRightFade) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      const threshold = 10;
      setLeftFade(scrollLeft > threshold);
      setRightFade(scrollLeft + clientWidth < scrollWidth - threshold);
    }
  };

  useEffect(() => {
    const el = topAiringCarouselRef.current;
    if (el) {
      el.addEventListener('scroll', () => checkScrollPosition(el, setShowAiringLeftFade, setShowAiringRightFade));
      checkScrollPosition(el, setShowAiringLeftFade, setShowAiringRightFade);
    }
    return () => el?.removeEventListener('scroll', () => checkScrollPosition(el, setShowAiringLeftFade, setShowAiringRightFade));
  }, [topAiring]);

  useEffect(() => {
    const el = topRatedCarouselRef.current;
    if (el) {
      el.addEventListener('scroll', () => checkScrollPosition(el, setShowRatedLeftFade, setShowRatedRightFade));
      checkScrollPosition(el, setShowRatedLeftFade, setShowRatedRightFade);
    }
    return () => el?.removeEventListener('scroll', () => checkScrollPosition(el, setShowRatedLeftFade, setShowRatedRightFade));
  }, [topRated]);

  useEffect(() => {
    const el = popularSeasonCarouselRef.current;
    if (el) {
      el.addEventListener('scroll', () => checkScrollPosition(el, setShowPopularLeftFade, setShowPopularRightFade));
      checkScrollPosition(el, setShowPopularLeftFade, setShowPopularRightFade);
    }
    return () => el?.removeEventListener('scroll', () => checkScrollPosition(el, setShowPopularLeftFade, setShowPopularRightFade));
  }, [popularSeason]);

  useEffect(() => {
    const handleResize = () => {
      checkScrollPosition(topAiringCarouselRef, setShowAiringLeftFade, setShowAiringRightFade);
      checkScrollPosition(topRatedCarouselRef, setShowRatedLeftFade, setShowRatedRightFade);
      checkScrollPosition(popularSeasonCarouselRef, setShowPopularLeftFade, setShowPopularRightFade);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchTopAiring = async () => {
      try {
        setLoadingAiring(true);
        const res = await fetch('/api/anime/top-airing');
        const data = await res.json();
        setTopAiring(data);
      } catch (e) {
        setErrorAiring(e);
      } finally {
        setLoadingAiring(false);
      }
    };
    fetchTopAiring();
  }, []);

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        setLoadingRated(true);
        const res = await fetch('/api/anime/top-rated');
        const data = await res.json();
        setTopRated(data);
      } catch (e) {
        setErrorRated(e);
      } finally {
        setLoadingRated(false);
      }
    };
    fetchTopRated();
  }, []);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        setLoadingPopular(true);
        const res = await fetch('/api/anime/popular-season');
        const data = await res.json();
        setPopularSeason(data);
      } catch (e) {
        setErrorPopular(e);
      } finally {
        setLoadingPopular(false);
      }
    };
    fetchPopular();
  }, []);

  const handleGenreTagClick = (genre) => {
    navigate(`/search-results?genre=${encodeURIComponent(genre)}`);
    setSelectedSearchGenre(genre);
  };

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
          <div className="error-message">
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
        {/* Genre Filter */}
        <section className="genre-filter">
          <h2 className="section-title">Browse by Genre:</h2>
          <div className="genre-buttons">
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
        </section>

        {/* Top Airing Section */}
        <section className="top-airing">
          <h2 className="section-title">Top Airing Anime</h2>
          <div className="carousel-fade-wrapper">
            <div className="anime-carousel" ref={topAiringCarouselRef}>
              {topAiring.map((anime) => (
                <Link to={`/anime/${anime.id}`} key={anime.id} className="anime-card-link">
                  <div className="anime-card">
                    {anime.main_picture && <img src={anime.main_picture} alt={anime.title} />}
                    <div className="hover-info">
                      <h3>{anime.title}</h3>
                      {anime.mean && <p>Score: {anime.mean}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {showAiringLeftFade && <div className="fade-overlay fade-left" />}
            {showAiringRightFade && <div className="fade-overlay fade-right" />}
          </div>
        </section>

        {/* Top Rated Section */}
        <section className="top-rated">
          <h2 className="section-title">Top Rated Anime</h2>
          <div className="carousel-fade-wrapper">
            <div className="anime-carousel" ref={topRatedCarouselRef}>
              {topRated.map((anime) => (
                <Link to={`/anime/${anime.id}`} key={anime.id} className="anime-card-link">
                  <div className="anime-card">
                    {anime.main_picture && <img src={anime.main_picture} alt={anime.title} />}
                    <div className="hover-info">
                      <h3>{anime.title}</h3>
                      {anime.mean && <p>Score: {anime.mean}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {showRatedLeftFade && <div className="fade-overlay fade-left" />}
            {showRatedRightFade && <div className="fade-overlay fade-right" />}
          </div>
        </section>

        {/* Popular This Season Section */}
        <section className="popular-season">
          <h2 className="section-title">Popular This Season</h2>
          <div className="carousel-fade-wrapper">
            <div className="anime-carousel" ref={popularSeasonCarouselRef}>
              {popularSeason.map((anime) => (
                <Link to={`/anime/${anime.id}`} key={anime.id} className="anime-card-link">
                  <div className="anime-card">
                    {anime.main_picture && <img src={anime.main_picture} alt={anime.title} />}
                    <div className="hover-info">
                      <h3>{anime.title}</h3>
                      {anime.mean && <p>Score: {anime.mean}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {showPopularLeftFade && <div className="fade-overlay fade-left" />}
            {showPopularRightFade && <div className="fade-overlay fade-right" />}
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
