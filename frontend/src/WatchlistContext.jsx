import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loadingWatchlistGlobal, setLoadingWatchlistGlobal] = useState(true);
  const [errorWatchlistGlobal, setErrorWatchlistGlobal] = useState(null);

  const fetchWatchlistGlobal = useCallback(async () => {
    try {
      setLoadingWatchlistGlobal(true);
      setErrorWatchlistGlobal(null);
      const response = await axios.get('/api/user/watchlist');
      setWatchlist(response.data);
    } catch (error) {
      console.error('Error fetching global watchlist:', error);
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
      await axios.put(`/api/user/watchlist/${animeId}`, { status: newStatus });
      setWatchlist(prevWatchlist =>
        prevWatchlist.map(item =>
          item.animeId === parseInt(animeId, 10) ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error('Error updating global watchlist status:', error);
      // Consider showing an error message to the user
    }
  }, []);

  const addToWatchlistGlobal = useCallback(async (animeId, status) => {
    try {
      await axios.post('/api/user/watchlist', { animeId, status });
      fetchWatchlistGlobal(); // Refetch the list to include the
    } catch (error) {
      console.error('Error adding to global watchlist:', error);
    }
  }, [fetchWatchlistGlobal]);

  return (
    <WatchlistContext.Provider value={{ watchlist, loadingWatchlistGlobal, errorWatchlistGlobal, updateWatchlistStatusGlobal, fetchWatchlistGlobal, addToWatchlistGlobal }}>
      {children}
    </WatchlistContext.Provider>
  );
};