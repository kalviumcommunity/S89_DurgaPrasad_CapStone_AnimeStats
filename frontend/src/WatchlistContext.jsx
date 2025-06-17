import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true; // Ensure cookies are sent with all requests

export const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loadingWatchlistGlobal, setLoadingWatchlistGlobal] = useState(true);
  const [errorWatchlistGlobal, setErrorWatchlistGlobal] = useState(null);

  const fetchWatchlistGlobal = useCallback(async () => {
    try {
      setLoadingWatchlistGlobal(true);
      setErrorWatchlistGlobal(null);

      const response = await axios.get('http://localhost:8080/api/user/watchlist', {
        withCredentials: true,
      });

      setWatchlist(response.data);
    } catch (error) {
      setErrorWatchlistGlobal('Failed to load watchlist.');
    } finally {
      setLoadingWatchlistGlobal(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlistGlobal();
  }, [fetchWatchlistGlobal]);

  const updateWatchlistStatusGlobal = useCallback(async (animeId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/user/watchlist/${animeId}`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (response.data && response.data.watchlist) {
        setWatchlist(response.data.watchlist);
      } else {
        fetchWatchlistGlobal();
      }
    } catch (error) {
      // No state change on error
    }
  }, [fetchWatchlistGlobal]);

  const addToWatchlistGlobal = useCallback(async (animeId, status) => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/user/watchlist',
        { animeId, status },
        { withCredentials: true }
      );

      if (response.data && response.data.watchlist) {
        setWatchlist(response.data.watchlist);
      }
    } catch (error) {
      // No state change on error
    }
  }, []);

  const removeFromWatchlistGlobal = useCallback(async (animeId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/user/watchlist/${animeId}`,
        { withCredentials: true }
      );

      if (response.data && response.data.watchlist) {
        setWatchlist(response.data.watchlist);
      }
    } catch (error) {
      // No state change on error
    }
  }, []);
  
  return (
    <WatchlistContext.Provider value={{
      watchlist,
      loadingWatchlistGlobal,
      errorWatchlistGlobal,
      updateWatchlistStatusGlobal,
      fetchWatchlistGlobal,
      addToWatchlistGlobal,
      removeFromWatchlistGlobal,
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};
