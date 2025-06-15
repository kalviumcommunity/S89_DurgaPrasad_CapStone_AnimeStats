

// // src/WatchlistContext.jsx
// import React, { createContext, useState, useEffect, useCallback } from 'react';
// import axios from 'axios';

// axios.defaults.withCredentials = true; 

// export const WatchlistContext = createContext();

// export const WatchlistProvider = ({ children }) => {
//   const [watchlist, setWatchlist] = useState([]);
//   const [loadingWatchlistGlobal, setLoadingWatchlistGlobal] = useState(true);
//   const [errorWatchlistGlobal, setErrorWatchlistGlobal] = useState(null);

//   const fetchWatchlistGlobal = useCallback(async () => {
//     try {
//       setLoadingWatchlistGlobal(true);
//       setErrorWatchlistGlobal(null);
//       const response = await axios.get('/api/user/watchlist'); // Will be proxied to 8080
//       setWatchlist(response.data);
//     } catch (error) {
//       console.error('Error fetching global watchlist:', error);
//       setErrorWatchlistGlobal('Failed to load watchlist.');
//     } finally {
//       setLoadingWatchlistGlobal(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchWatchlistGlobal();
//   }, [fetchWatchlistGlobal]);

//   const updateWatchlistStatusGlobal = useCallback(async (animeId, newStatus) => {
//     try {
//       await axios.put(`/api/user/watchlist/${animeId}`, { status: newStatus });
//       setWatchlist(prev =>
//         prev.map(item =>
//           item.animeId === parseInt(animeId, 10) ? { ...item, status: newStatus } : item
//         )
//       );
//     } catch (error) {
//       console.error('Error updating global watchlist status:', error);
//     }
//   }, []);

//   const addToWatchlistGlobal = useCallback(async (animeId, status) => {
//     try {
//       await axios.post('/api/user/watchlist', { animeId, status });
//       fetchWatchlistGlobal();
//     } catch (error) {
//       console.error('Error adding to global watchlist:', error);
//     }
//   }, [fetchWatchlistGlobal]);

//   return (
//     <WatchlistContext.Provider value={{
//       watchlist,
//       loadingWatchlistGlobal,
//       errorWatchlistGlobal,
//       updateWatchlistStatusGlobal,
//       fetchWatchlistGlobal,
//       addToWatchlistGlobal
//     }}>
//       {children}
//     </WatchlistContext.Provider>
//   );
// };

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

  const updateWatchlistStatusGlobal = useCallback(async (animeId, newStatus) => {
    try {
      console.log(`🔄 Updating status for animeId=${animeId} to "${newStatus}"`);
      const response = await axios.put(
        `http://localhost:8080/api/user/watchlist/${animeId}`,
        { status: newStatus },
        { withCredentials: true }
      );

      console.log('✅ Status updated response:', response.data);

      setWatchlist(prev =>
        prev.map(item =>
          item.animeId === parseInt(animeId, 10) ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error('❌ Error updating global watchlist status:', error?.response?.data || error.message);
    }
  }, []);

  const addToWatchlistGlobal = useCallback(async (animeId, status) => {
    try {
      console.log(`➕ Adding animeId=${animeId} with status="${status}" to watchlist...`);
      const response = await axios.post(
        'http://localhost:8080/api/user/watchlist',
        { animeId, status },
        { withCredentials: true }
      );

      console.log('✅ Watchlist Add Response:', response.data);

      fetchWatchlistGlobal(); // Refresh after add
    } catch (error) {
      console.error('❌ Error adding to global watchlist:', error?.response?.data || error.message);
    }
  }, [fetchWatchlistGlobal]);

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      loadingWatchlistGlobal,
      errorWatchlistGlobal,
      updateWatchlistStatusGlobal,
      fetchWatchlistGlobal,
      addToWatchlistGlobal
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};
