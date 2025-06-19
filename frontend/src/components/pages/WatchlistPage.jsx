import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './WatchlistPage.css';
import { WatchlistContext } from '../../WatchlistContext';
import { Link } from 'react-router-dom';
import Navbar from '../../Navbar';

const WatchlistPage = () => {
  const {
    watchlist,
    loadingWatchlistGlobal,
    errorWatchlistGlobal,
    updateWatchlistStatusGlobal,
    removeFromWatchlistGlobal
  } = useContext(WatchlistContext);

  const [detailedWatchlist, setDetailedWatchlist] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [errorDetails, setErrorDetails] = useState(null);

  // ✅ FIX #1: Replaced the hardcoded URL with the single, reliable environment variable.
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!loadingWatchlistGlobal && watchlist && watchlist.length > 0) {
      setLoadingDetails(true);
      setErrorDetails(null);
      const fetchDetails = async () => {
        const details = await Promise.all(
          watchlist.map(async (item) => {
            try {
              // ✅ FIX #2: Removed '/api' and the redundant 'withCredentials' object.
              const animeDetailsResponse = await axios.get(
                `${BASE_URL}/anime/${item.animeId}`
              );
              return { ...item, animeDetails: animeDetailsResponse.data };
            } catch (error) {
              console.error(`Error fetching details for anime ID ${item.animeId}:`, error);
              return { ...item, errorFetchingDetails: true };
            }
          })
        );
        setDetailedWatchlist(details);
        setLoadingDetails(false);
      };
      fetchDetails();
    } else if (!loadingWatchlistGlobal) {
      setDetailedWatchlist([]);
      setLoadingDetails(false);
    }
  }, [watchlist, loadingWatchlistGlobal, BASE_URL]); // Added BASE_URL to dependency array for correctness

  const handleStatusChange = (animeId, newStatus) => {
    updateWatchlistStatusGlobal(animeId, newStatus);
  };

  const handleDelete = (animeId, animeTitle) => {
    if (window.confirm(`Are you sure you want to remove "${animeTitle}" from your watchlist?`)) {
      removeFromWatchlistGlobal(animeId);
    }
  };

  if (loadingWatchlistGlobal || loadingDetails) {
    return (
      <>
        <Navbar />
        <div className="watchlist-page">
          <div className="loading-message">Loading your watchlist...</div>
        </div>
      </>
    );
  }

  if (errorWatchlistGlobal || errorDetails) {
    return (
      <>
        <Navbar />
        <div className="watchlist-page">
          <div className="error-message">Error loading your watchlist. Please try again later.</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="watchlist-page">
        <h1>My Watchlist</h1>
        {detailedWatchlist.length > 0 ? (
          <div className="watchlist-grid">
            {detailedWatchlist.map(item => (
              <div key={item.animeId} className="watchlist-item">
                {item.animeDetails ? (
                  <>
                    <Link
                      to={`/anime/${item.animeId}`}
                      className="watchlist-item-link"
                      data-title={item.animeDetails.title}
                    >
                      {item.animeDetails.main_picture && (
                        <img
                          src={
                            typeof item.animeDetails.main_picture === 'object' && item.animeDetails.main_picture.medium
                              ? item.animeDetails.main_picture.medium
                              : item.animeDetails.main_picture
                          }
                          alt={item.animeDetails.title}
                        />
                      )}
                    </Link>

                    <div className="watchlist-controls">
                      <div className="status-label-group">
                        <span>Status</span>
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.animeId, e.target.value)}
                          className="status-select"
                        >
                          <option value="plan_to_watch">Plan to Watch</option>
                          <option value="watching">Watching</option>
                          <option value="completed">Completed</option>
                          <option value="on_hold">On Hold</option>
                          <option value="dropped">Dropped</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleDelete(item.animeId, item.animeDetails.title)}
                        className="delete-button"
                        title="Remove from watchlist"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : item.errorFetchingDetails ? (
                  <p>Error loading details for anime ID: {item.animeId}</p>
                ) : (
                  <p>Loading details for an anime...</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Your watchlist is empty.</p>
        )}
      </div>
    </>
  );
};

export default WatchlistPage;