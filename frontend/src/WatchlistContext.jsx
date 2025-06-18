import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true; // Always send cookies (session)

export const WatchlistContext = createContext();

// ✅ Use VITE_API_URL from .env (safe and recommended)
const BASE_URL = import.meta.env.VITE_API_URL;

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loadingWatchlistGlobal, setLoadingWatchlistGlobal] = useState(true);
  const [errorWatchlistGlobal, setErrorWatchlistGlobal] = useState(null);

  const fetchWatchlistGlobal = useCallback(async () => {
    try {
      setLoadingWatchlistGlobal(true);
      setErrorWatchlistGlobal(null);

      const response = await axios.get(`${BASE_URL}/api/user/watchlist`, {
        withCredentials: true,
      });

      setWatchlist(response.data);
    } catch (error) {
      setErrorWatchlistGlobal('Failed to load watchlist.');
      console.error('Fetch Watchlist Error:', error.response?.data || error.message);
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
        `${BASE_URL}/api/user/watchlist/${animeId}`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (response.data?.watchlist) {
        setWatchlist(response.data.watchlist);
      } else {
        fetchWatchlistGlobal();
      }
    } catch (error) {
      console.error('Update Watchlist Error:', error.response?.data || error.message);
    }
  }, [fetchWatchlistGlobal]);

  const addToWatchlistGlobal = useCallback(async (animeId, status) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/user/watchlist`,
        { animeId, status },
        { withCredentials: true }
      );

      if (response.data?.watchlist) {
        setWatchlist(response.data.watchlist);
      }
    } catch (error) {
      console.error('Add to Watchlist Error:', error.response?.data || error.message);
    }
  }, []);

  const removeFromWatchlistGlobal = useCallback(async (animeId) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/user/watchlist/${animeId}`,
        { withCredentials: true }
      );

      if (response.data?.watchlist) {
        setWatchlist(response.data.watchlist);
      }
    } catch (error) {
      console.error('Remove from Watchlist Error:', error.response?.data || error.message);
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
