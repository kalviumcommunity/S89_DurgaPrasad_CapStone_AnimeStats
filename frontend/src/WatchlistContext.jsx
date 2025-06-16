

// import React, { createContext, useState, useEffect, useCallback } from 'react';
// import axios from 'axios';

// axios.defaults.withCredentials = true; // Ensure cookies are sent with all requests

// export const WatchlistContext = createContext();

// export const WatchlistProvider = ({ children }) => {
//   const [watchlist, setWatchlist] = useState([]);
//   const [loadingWatchlistGlobal, setLoadingWatchlistGlobal] = useState(true);
//   const [errorWatchlistGlobal, setErrorWatchlistGlobal] = useState(null);

//   const fetchWatchlistGlobal = useCallback(async () => {
//     try {
//       console.log('📥 Fetching watchlist...');
//       setLoadingWatchlistGlobal(true);
//       setErrorWatchlistGlobal(null);

//       const response = await axios.get('http://localhost:8080/api/user/watchlist', {
//         withCredentials: true,
//       });

//       console.log('✅ Watchlist fetched:', response.data);
//       setWatchlist(response.data);
//     } catch (error) {
//       console.error('❌ Error fetching global watchlist:', error?.response?.data || error.message);
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
//       console.log(`🔄 Updating status for animeId=${animeId} to "${newStatus}"`);
//       const response = await axios.put(
//         `http://localhost:8080/api/user/watchlist/${animeId}`,
//         { status: newStatus },
//         { withCredentials: true }
//       );

//       console.log('✅ Status updated response:', response.data);

//       // It's safer to use the response from the server if it returns the updated list.
//       // If not, an optimistic update is okay for status changes.
//       if (response.data && response.data.watchlist) {
//         setWatchlist(response.data.watchlist);
//       } else {
//         setWatchlist(prev =>
//           prev.map(item =>
//             item.animeId === parseInt(animeId, 10) ? { ...item, status: newStatus } : item
//           )
//         );
//       }
//     } catch (error) {
//       console.error('❌ Error updating global watchlist status:', error?.response?.data || error.message);
//       // You might want to add user-facing error feedback here
//     }
//   }, []);

//   const addToWatchlistGlobal = useCallback(async (animeId, status) => {
//     try {
//       console.log(`➕ Adding animeId=${animeId} with status="${status}" to watchlist...`);
//       const response = await axios.post(
//         'http://localhost:8080/api/user/watchlist',
//         { animeId, status },
//         { withCredentials: true }
//       );

//       console.log('✅ Watchlist Add Response:', response.data);

//       // It's better to update state with the server's response to stay in sync
//       if (response.data && response.data.watchlist) {
//         setWatchlist(response.data.watchlist);
//       } else {
//         fetchWatchlistGlobal(); // Fallback to refetch the whole list
//       }
//     } catch (error) {
//       console.error('❌ Error adding to global watchlist:', error?.response?.data || error.message);
//       // You might want to add user-facing error feedback here
//     }
//   }, [fetchWatchlistGlobal]);

//   // --- THIS IS THE UPDATED, SAFER DELETE FUNCTION ---
//   const removeFromWatchlistGlobal = useCallback(async (animeId) => {
//     try {
//       console.log(`🗑️ Removing animeId=${animeId} from watchlist...`);
      
//       // 1. Make the API call and wait for it to complete successfully.
//       const response = await axios.delete(
//         `http://localhost:8080/api/user/watchlist/${animeId}`,
//         { withCredentials: true }
//       );

//       console.log(`✅ Successfully removed animeId=${animeId}`);
      
//       // 2. ONLY after success, update the UI state.
//       // This assumes your backend DELETE route returns the updated watchlist.
//       // If it doesn't, this check will prevent errors.
//       if (response.data && response.data.watchlist) {
//         setWatchlist(response.data.watchlist);
//       } else {
//         // As a fallback if the backend doesn't return the list,
//         // we can still update manually, but now we know it's safe.
//         setWatchlist(prev => prev.filter(item => item.animeId !== parseInt(animeId, 10)));
//       }

//     } catch (error) {
//       console.error('❌ Error removing from global watchlist:', error?.response?.data || error.message);
//       // Now, we DON'T refetch on error. We just log it and maybe show a message.
//       // The UI state remains correct because we never changed it.
//       // You could add a user-facing error message here.
//       // For example: alert('Failed to remove item. Please try again.');
//     }
//   }, []); // The dependency on fetchWatchlistGlobal is no longer needed
//   // --- END OF UPDATED FUNCTION ---


//   return (
//     <WatchlistContext.Provider value={{
//       watchlist,
//       loadingWatchlistGlobal,
//       errorWatchlistGlobal,
//       updateWatchlistStatusGlobal,
//       fetchWatchlistGlobal,
//       addToWatchlistGlobal,
//       removeFromWatchlistGlobal // The updated function is still provided here
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
    } catch (error)
    {
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