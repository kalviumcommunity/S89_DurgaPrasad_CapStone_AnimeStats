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
      console.log('📥 Fetching watchlist...');
      setLoadingWatchlistGlobal(true);
      setErrorWatchlistGlobal(null);

      const response = await axios.get('http://localhost:8080/api/user/watchlist', {
        withCredentials: true,
      });

      console.log('✅ Watchlist fetched:', response.data);
      setWatchlist(response.data);
    } catch (error) {
      console.error('❌ Error fetching global watchlist:', error?.response?.data || error.message);
      setErrorWatchlistGlobal('Failed to load watchlist.');
    } finally {
      setLoadingWatchlistGlobal(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlistGlobal();
  }, [fetchWatchlistGlobal]);

  // --- UPDATED: This function is now more robust ---
  const updateWatchlistStatusGlobal = useCallback(async (animeId, newStatus) => {
    try {
      console.log(`🔄 Updating status for animeId=${animeId} to "${newStatus}"`);
      
      // We wait for the server to confirm the update
      const response = await axios.put(
        `http://localhost:8080/api/user/watchlist/${animeId}`,
        { status: newStatus },
        { withCredentials: true }
      );

      console.log('✅ Status updated response:', response.data);
      
      // We update our entire local state with the fresh list from the server.
      // This prevents any data inconsistencies.
      if (response.data && response.data.watchlist) {
        setWatchlist(response.data.watchlist);
      } else {
        // As a fallback, we can refetch the whole list if the server response is unexpected
        fetchWatchlistGlobal();
      }
    } catch (error) {
      console.error('❌ Error updating global watchlist status:', error?.response?.data || error.message);
      // We don't change the state on error, so the UI remains correct.
    }
  }, [fetchWatchlistGlobal]); // Added dependency for the fallback case

  const addToWatchlistGlobal = useCallback(async (animeId, status) => {
    try {
      console.log(`➕ Adding animeId=${animeId} with status="${status}" to watchlist...`);
      const response = await axios.post(
        'http://localhost:8080/api/user/watchlist',
        { animeId, status },
        { withCredentials: true }
      );

      console.log('✅ Watchlist Add Response:', response.data);
      if (response.data && response.data.watchlist) {
        setWatchlist(response.data.watchlist);
      }
    } catch (error) {
      console.error('❌ Error adding to global watchlist:', error?.response?.data || error.message);
    }
  }, []);

  const removeFromWatchlistGlobal = useCallback(async (animeId) => {
    try {
      console.log(`🗑️ Removing animeId=${animeId} from watchlist...`);
      const response = await axios.delete(
        `http://localhost:8080/api/user/watchlist/${animeId}`,
        { withCredentials: true }
      );

      console.log(`✅ Successfully removed animeId=${animeId}`);
      if (response.data && response.data.watchlist) {
        setWatchlist(response.data.watchlist);
      }
    } catch (error){
      console.error('❌ Error removing from global watchlist:', error?.response?.data || error.message);
    }
  }, []);
  
  // The 'refreshWatchlistDataGlobal' function has been removed.

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      loadingWatchlistGlobal,
      errorWatchlistGlobal,
      updateWatchlistStatusGlobal,
      fetchWatchlistGlobal,
      addToWatchlistGlobal,
      removeFromWatchlistGlobal,
      // The 'refresh' function is no longer provided.
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};