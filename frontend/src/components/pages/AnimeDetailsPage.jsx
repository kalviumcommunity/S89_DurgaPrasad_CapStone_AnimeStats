import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './AnimeDetailsPage.css';

import Navbar from '../../Navbar'; // ✅ Imported Navbar
import { WatchlistContext } from '../../WatchlistContext';

const AnimeDetailsPage = () => {
  const { id } = useParams();
  const [animeDetails, setAnimeDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [errorDetails, setErrorDetails] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('plan_to_watch');

  const { watchlist, updateWatchlistStatusGlobal, addToWatchlistGlobal } = useContext(WatchlistContext);

  const fetchAnimeDetails = useCallback(async () => {
    try {
      setLoadingDetails(true);
      setErrorDetails(null);
      const response = await axios.get(`/api/anime/${id}`);
      setAnimeDetails(response.data);
    } catch (err) {
      console.error('Error fetching anime details:', err);
      setErrorDetails('Failed to load anime details. Please try again later.');
    } finally {
      setLoadingDetails(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchAnimeDetails();
    }
  }, [id, fetchAnimeDetails]);

  useEffect(() => {
    if (id && watchlist) {
      const currentAnimeId = parseInt(id, 10);
      const existingItem = watchlist.find(item => item.animeId === currentAnimeId);
      if (existingItem) {
        setIsInWatchlist(true);
        setWatchlistStatus(existingItem.status);
        setSelectedStatus(existingItem.status);
      } else {
        setIsInWatchlist(false);
        setWatchlistStatus(null);
        setSelectedStatus('plan_to_watch');
      }
    }
  }, [id, watchlist]);

  const handleAddToWatchlist = async () => {
    setIsAdding(true);
    try {
      const currentAnimeId = parseInt(id, 10);
      await addToWatchlistGlobal(currentAnimeId, selectedStatus);
      setIsInWatchlist(true);
      setWatchlistStatus(selectedStatus);
    } catch (error) {
      console.error('Error adding to watchlist:', error.response?.data?.message || error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    updateWatchlistStatusGlobal(id, newStatus);
  };

  if (loadingDetails) {
    return <div className="anime-details-container loading">Loading data...</div>;
  }

  if (errorDetails) {
    return <div className="anime-details-container error">Error: {errorDetails}</div>;
  }

  if (!animeDetails) {
    return <div className="anime-details-container no-data">No anime details found.</div>;
  }

  const renderArray = (arr) => {
    return arr && arr.length > 0 ? arr.map(item => item.name).join(', ') : 'N/A';
  };

  return (
    <>
      <Navbar /> {/* ✅ Rendered Navbar here */}

      <div className="anime-details-page">
        <div className="anime-details-header">
          <h1 className="anime-details-title">{animeDetails.title}</h1>
        </div>

        <div className="anime-details-content">
          <div className="anime-details-main-info">
            {animeDetails.main_picture && (
              <img
                src={animeDetails.main_picture}
                alt={animeDetails.title}
                className="anime-details-poster"
              />
            )}
            <div className="anime-details-meta">
              <p><strong>Score:</strong> {animeDetails.mean ? animeDetails.mean.toFixed(2) : 'N/A'}</p>
              <p><strong>Rank:</strong> {animeDetails.rank ? `#${animeDetails.rank}` : 'N/A'}</p>
              <p><strong>Popularity:</strong> {animeDetails.popularity ? `#${animeDetails.popularity}` : 'N/A'}</p>
              <p><strong>Episodes:</strong> {animeDetails.num_episodes || 'N/A'}</p>
              <p><strong>Status:</strong> {animeDetails.status || 'N/A'}</p>
              <p><strong>Aired:</strong> {animeDetails.start_date || 'N/A'} {animeDetails.end_date && animeDetails.end_date !== animeDetails.start_date ? `to ${animeDetails.end_date}` : ''}</p>
              <p><strong>Broadcast:</strong> {animeDetails.broadcast?.day_of_the_week ? `${animeDetails.broadcast.day_of_the_week}s at ${animeDetails.broadcast.start_time || 'N/A'} (${animeDetails.broadcast.timezone || 'N/A'})` : 'N/A'}</p>
              <p><strong>Rating:</strong> {animeDetails.rating || 'N/A'}</p>
              <p><strong>Genres:</strong> {renderArray(animeDetails.genres)}</p>
              <p><strong>Studios:</strong> {renderArray(animeDetails.studios)}</p>
              <p><strong>Users:</strong> {animeDetails.num_list_users ? animeDetails.num_list_users.toLocaleString() : 'N/A'}</p>
              <p>
                <strong>Status:</strong>
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{ marginLeft: '10px' }}
                >
                  <option value="plan_to_watch">Plan to Watch</option>
                  <option value="watching">Watching</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="dropped">Dropped</option>
                </select>
                {!isInWatchlist && (
                  <button onClick={handleAddToWatchlist} disabled={isAdding}>
                    {isAdding ? 'Adding...' : 'Add to My Watchlist'}
                  </button>
                )}
              </p>
            </div>
          </div>

          <div className="anime-details-synopsis">
            <h2>Synopsis</h2>
            <p>{animeDetails.synopsis || 'Synopsis not available.'}</p>
          </div>

          {animeDetails.background && (
            <div className="anime-details-section background-section">
              <h2>Background</h2>
              <p>{animeDetails.background}</p>
            </div>
          )}

          {animeDetails.characters && animeDetails.characters.length > 0 && (
            <div className="anime-details-section characters-section">
              <h2>Characters</h2>
              <div className="characters-grid">
                {animeDetails.characters.slice(0, 10).map((char, index) => (
                  <div key={char.character.id || index} className="character-item">
                    <img
                      src={char.character.main_picture?.medium || char.character.main_picture?.large}
                      alt={char.character.name}
                      className="character-image"
                    />
                    <p className="character-name">{char.character.name}</p>
                    {char.role && <p className="character-role">({char.role})</p>}
                    {char.voice_actors && char.voice_actors.length > 0 && (
                      <p className="character-voice-actor">
                        VA: {char.voice_actors[0].person.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {animeDetails.related_anime && animeDetails.related_anime.length > 0 && (
            <div className="anime-details-section related-anime-section">
              <h2>Related Anime</h2>
              <div className="related-anime-list">
                {animeDetails.related_anime.map((related, index) => (
                  <div key={related.node.id || index} className="related-anime-item">
                    <Link to={`/anime/${related.node.id}`}>
                      <img
                        src={related.node.main_picture?.medium}
                        alt={related.node.title}
                        className="related-anime-image"
                      />
                      <p className="related-anime-title">{related.node.title}</p>
                    </Link>
                    <p className="related-anime-relation">({related.relation_type_formatted})</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AnimeDetailsPage;
