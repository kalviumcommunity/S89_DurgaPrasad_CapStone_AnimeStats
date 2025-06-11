
// // client/src/pages/WatchlistPage.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './WatchlistPage.css'; 

// const WatchlistPage = () => {
//   const [watchlist, setWatchlist] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchWatchlist = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await axios.get('/api/user/watchlist');
//         const initialWatchlist = response.data;

//         // Fetch full anime details for each item in the watchlist
//         const detailedWatchlist = await Promise.all(
//           initialWatchlist.map(async (item) => {
//             try {
//               const animeDetailsResponse = await axios.get(`/api/anime/${item.animeId}`);
//               return { ...item, animeDetails: animeDetailsResponse.data }; // Combine watchlist data with anime details
//             } catch (error) {
//               console.error(`Error fetching details for anime ID ${item.animeId}:`, error);
//               return { ...item, errorFetchingDetails: true }; // Indicate an error occurred
//             }
//           })
//         );

//         setWatchlist(detailedWatchlist);
//       } catch (err) {
//         console.error('Error fetching watchlist:', err);
//         setError('Failed to load your watchlist.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchWatchlist();
//   }, []);

//   const handleStatusChange = async (animeId, newStatus) => {
//     try {
//       await axios.put(`/api/user/watchlist/${animeId}`, { status: newStatus });
//       // Update the watchlist state to reflect the change immediately
//       setWatchlist(prevWatchlist =>
//         prevWatchlist.map(item =>
//           item.animeId === animeId ? { ...item, status: newStatus } : item
//         )
//       );
//       console.log(`Status updated for anime ID ${animeId} to ${newStatus}`);
//       // Optionally show a success message
//     } catch (error) {
//       console.error(`Error updating status for anime ID ${animeId}:`, error);
//       // Optionally show an error message to the user
//     }
//   };

//   if (loading) {
//     return <div>Loading your watchlist...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return (
//     <div className="watchlist-page">
//       <h1>My Watchlist</h1>
//       {watchlist.length > 0 ? (
//         <div className="watchlist-grid">
//           {watchlist.map(item => (
//             <div key={item.animeId} className="watchlist-item">
//               {item.animeDetails ? (
//                 <>
//                   <h3>{item.animeDetails.title}</h3>
//                   {item.animeDetails.main_picture && (
//                     <img
//                       src={
//                         typeof item.animeDetails.main_picture === 'object' && item.animeDetails.main_picture.medium
//                           ? item.animeDetails.main_picture.medium
//                           : item.animeDetails.main_picture
//                       }
//                       alt={item.animeDetails.title}
//                     />
//                   )}
//                   <p>Status:
//                     <select
//                       value={item.status}
//                       onChange={(e) => handleStatusChange(item.animeId, e.target.value)}
//                     >
//                       <option value="plan_to_watch">Plan to Watch</option>
//                       <option value="watching">Watching</option>
//                       <option value="completed">Completed</option>
//                       <option value="on_hold">On Hold</option>
//                       <option value="dropped">Dropped</option>
//                     </select>
//                   </p>
//                   {/* You can display other tracking information here (score, progress, etc.) */}
//                 </>
//               ) : item.errorFetchingDetails ? (
//                 <p>Error loading details for anime ID: {item.animeId}</p>
//               ) : (
//                 <p>Loading details for anime ID: {item.animeId}...</p>
//               )}
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p>Your watchlist is empty.</p>
//       )}
//     </div>
//   );
// };

// export default WatchlistPage;



// import React, { useState, useEffect, useContext } from 'react';
// import axios from 'axios';
// import './WatchlistPage.css';
// import { WatchlistContext } from '../../WatchlistContext'; // Adjust the path
// import { Link } from 'react-router-dom';

// const WatchlistPage = () => {
//   const { watchlist, loadingWatchlistGlobal, errorWatchlistGlobal, updateWatchlistStatusGlobal } = useContext(WatchlistContext);
//   const [detailedWatchlist, setDetailedWatchlist] = useState([]);
//   const [loadingDetails, setLoadingDetails] = useState(true);
//   const [errorDetails, setErrorDetails] = useState(null);

//   useEffect(() => {
//     if (!loadingWatchlistGlobal && watchlist) {
//       const fetchDetails = async () => {
//         setLoadingDetails(true);
//         setErrorDetails(null);
//         const details = await Promise.all(
//           watchlist.map(async (item) => {
//             try {
//               const animeDetailsResponse = await axios.get(`/api/anime/${item.animeId}`);
//               return { ...item, animeDetails: animeDetailsResponse.data };
//             } catch (error) {
//               console.error(`Error fetching details for anime ID ${item.animeId}:`, error);
//               return { ...item, errorFetchingDetails: true };
//             }
//           })
//         );
//         setDetailedWatchlist(details);
//         setLoadingDetails(false);
//       };
//       fetchDetails();
//     }
//   }, [watchlist, loadingWatchlistGlobal]);

//   const handleStatusChange = async (animeId, newStatus) => {
//     updateWatchlistStatusGlobal(animeId, newStatus);
//   };

//   if (loadingWatchlistGlobal || loadingDetails) {
//     return <div>Loading your watchlist...</div>;
//   }

//   if (errorWatchlistGlobal || errorDetails) {
//     return <div>Error loading your watchlist. Please try again later.</div>;
//   }

//   const watchlistToRender = detailedWatchlist.length > 0 ? detailedWatchlist : watchlist;

//   return (
//     <div className="watchlist-page">
//       <h1>My Watchlist</h1>
//       {watchlistToRender.length > 0 ? (
//         <div className="watchlist-grid">
//           {watchlistToRender.map(item => (
//             <div key={item.animeId} className="watchlist-item">
//               {item.animeDetails ? (
//                 <>
//                   <Link to={`/anime/${item.animeId}`}>
//                     <h3>{item.animeDetails.title}</h3>
//                     {item.animeDetails.main_picture && (
//                       <img
//                         src={
//                           typeof item.animeDetails.main_picture === 'object' && item.animeDetails.main_picture.medium
//                             ? item.animeDetails.main_picture.medium
//                             : item.animeDetails.main_picture
//                         }
//                         alt={item.animeDetails.title}
//                       />
//                     )}
//                   </Link>
//                   <p>Status:
//                     <select
//                       value={item.status}
//                       onChange={(e) => handleStatusChange(item.animeId, e.target.value)}
//                     >
//                       <option value="plan_to_watch">Plan to Watch</option>
//                       <option value="watching">Watching</option>
//                       <option value="completed">Completed</option>
//                       <option value="on_hold">On Hold</option>
//                       <option value="dropped">Dropped</option>
//                     </select>
//                   </p>
//                   {/* You can display other tracking information here (score, progress, etc.) */}
//                 </>
//               ) : (
//                 <>
//                   <h3>Loading title...</h3>
//                   <p>Status: {item.status.replace(/_/g, ' ')}</p>
//                   {item.errorFetchingDetails && <p>Error loading details.</p>}
//                 </>
//               )}
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p>Your watchlist is empty.</p>
//       )}
//     </div>
//   );
// };

// export default WatchlistPage;

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