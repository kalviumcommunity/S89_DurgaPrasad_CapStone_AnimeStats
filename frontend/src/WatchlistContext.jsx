import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// This is perfect. It sets the default for all requests.
axios.defaults.withCredentials = true;

export const WatchlistContext = createContext();

// ✅ FIX #1: Using the CORRECT variable name from Netlify/env file.
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loadingWatchlistGlobal, setLoadingWatchlistGlobal] = useState(true);
  const [errorWatchlistGlobal, setErrorWatchlistGlobal] = useState(null);

  const fetchWatchlistGlobal = useCallback(async () => {
    try {
      setLoadingWatchlistGlobal(true);
      setErrorWatchlistGlobal(null);

      // ✅ FIX #2: Removed '/api' because it's now in BASE_URL.
      // ✅ FIX #3: Removed redundant withCredentials object.
      const response = await axios.get(`${BASE_URL}/user/watchlist`);

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
      // ✅ FIX #2 & #3 Applied here as well.
      const response = await axios.put(
        `${BASE_URL}/user/watchlist/${animeId}`,
        { status: newStatus }
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
      // ✅ FIX #2 & #3 Applied here as well.
      const response = await axios.post(
        `${BASE_URL}/user/watchlist`,
        { animeId, status }
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
      // ✅ FIX #2 & #3 Applied here as well.
      const response = await axios.delete(`${BASE_URL}/user/watchlist/${animeId}`);

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