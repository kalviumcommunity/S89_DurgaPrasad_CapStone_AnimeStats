

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './WatchlistPage.css';
import { WatchlistContext } from '../../WatchlistContext'; // Adjust the path
import { Link } from 'react-router-dom';

const WatchlistPage = () => {
  const { watchlist, loadingWatchlistGlobal, errorWatchlistGlobal, updateWatchlistStatusGlobal } = useContext(WatchlistContext);
  const [detailedWatchlist, setDetailedWatchlist] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [errorDetails, setErrorDetails] = useState(null);

  useEffect(() => {
    if (!loadingWatchlistGlobal && watchlist) {
      setLoadingDetails(true);
      setErrorDetails(null);
      const fetchDetails = async () => {
        const details = await Promise.all(
          watchlist.map(async (item) => {
            try {
              const animeDetailsResponse = await axios.get(`/api/anime/${item.animeId}`);
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
    }
  }, [watchlist, loadingWatchlistGlobal]);

  const handleStatusChange = async (animeId, newStatus) => {
    updateWatchlistStatusGlobal(animeId, newStatus);
    // No need for local state update here, global state will trigger re-render
  };

  if (loadingWatchlistGlobal || loadingDetails) {
    return <div>Loading your watchlist...</div>;
  }

  if (errorWatchlistGlobal || errorDetails) {
    return <div>Error loading your watchlist. Please try again later.</div>;
  }

  return (
    <div className="watchlist-page">
      <h1>My Watchlist</h1>
      {detailedWatchlist.length > 0 ? (
        <div className="watchlist-grid">
          {detailedWatchlist.map(item => (
            <div key={item.animeId} className="watchlist-item">
              {item.animeDetails ? (
                <>
                  <Link to={`/anime/${item.animeId}`}>
                    <h3>{item.animeDetails.title}</h3>
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
                  <p>Status:
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.animeId, e.target.value)}
                    >
                      <option value="plan_to_watch">Plan to Watch</option>
                      <option value="watching">Watching</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                      <option value="dropped">Dropped</option>
                    </select>
                  </p>
                  {/* You can display other tracking information here (score, progress, etc.) */}
                </>
              ) : item.errorFetchingDetails ? (
                <p>Error loading details for anime ID: {item.animeId}</p>
              ) : (
                <p>Loading details for anime ID: {item.animeId}...</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>Your watchlist is empty.</p>
      )}
    </div>
  );
};

export default WatchlistPage;