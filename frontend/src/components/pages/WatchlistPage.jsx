

// import React, { useState, useEffect, useContext } from 'react';
// import axios from 'axios';
// import './WatchlistPage.css';
// import { WatchlistContext } from '../../WatchlistContext'; // Adjust the path
// import { Link } from 'react-router-dom';

// const WatchlistPage = () => {
//   // Get all necessary functions and state from the context
//   const { watchlist, loadingWatchlistGlobal, errorWatchlistGlobal, updateWatchlistStatusGlobal, removeFromWatchlistGlobal } = useContext(WatchlistContext);
  
//   // Local state for managing the detailed data after fetching
//   const [detailedWatchlist, setDetailedWatchlist] = useState([]);
//   const [loadingDetails, setLoadingDetails] = useState(true);
//   const [errorDetails, setErrorDetails] = useState(null);

//   // This useEffect fetches full details for each item in the watchlist
//   useEffect(() => {
//     if (!loadingWatchlistGlobal && watchlist && watchlist.length > 0) {
//       setLoadingDetails(true);
//       setErrorDetails(null);
//       const fetchDetails = async () => {
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
//     } else if (!loadingWatchlistGlobal) {
//       // Handle the case where the watchlist is loaded but is empty
//       setDetailedWatchlist([]);
//       setLoadingDetails(false);
//     }
//   }, [watchlist, loadingWatchlistGlobal]);

//   // Handler for changing the status dropdown
//   const handleStatusChange = (animeId, newStatus) => {
//     updateWatchlistStatusGlobal(animeId, newStatus);
//   };

//   // Handler for the delete button
//   const handleDelete = (animeId, animeTitle) => {
//     if (window.confirm(`Are you sure you want to remove "${animeTitle}" from your watchlist?`)) {
//       removeFromWatchlistGlobal(animeId);
//     }
//   };

//   // Handle loading and error states before rendering
//   if (loadingWatchlistGlobal || loadingDetails) {
//     return <div className="loading-message">Loading your watchlist...</div>;
//   }

//   if (errorWatchlistGlobal || errorDetails) {
//     return <div className="error-message">Error loading your watchlist. Please try again later.</div>;
//   }

//   return (
//     <div className="watchlist-page">
//       <h1>My Watchlist</h1>
//       {detailedWatchlist.length > 0 ? (
//         <div className="watchlist-grid">
//           {detailedWatchlist.map(item => (
//             <div key={item.animeId} className="watchlist-item">
//               {item.animeDetails ? (
//                 <>
//                   {/* The Link now has a data-title attribute for the CSS hover overlay */}
//                   {/* The visible h3 is removed, as the title now appears on hover */}
//                   <Link 
//                     to={`/anime/${item.animeId}`} 
//                     className="watchlist-item-link" 
//                     data-title={item.animeDetails.title}
//                   >
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
                  
//                   {/* This wrapper correctly lays out the controls at the bottom */}
//                   <div className="watchlist-controls">
//                     <div className="status-label-group">
//                       <span>Status</span>
//                     </div>
//                     <select
//                       value={item.status}
//                       onChange={(e) => handleStatusChange(item.animeId, e.target.value)}
//                       className="status-select"
//                     >
//                       <option value="plan_to_watch">Plan to Watch</option>
//                       <option value="watching">Watching</option>
//                       <option value="completed">Completed</option>
//                       <option value="on_hold">On Hold</option>
//                       <option value="dropped">Dropped</option>
//                     </select>
                    
//                     <button
//                       onClick={() => handleDelete(item.animeId, item.animeDetails.title)}
//                       className="delete-button"
//                       title="Remove from watchlist"
//                     >
//                      Remove
//                     </button>
//                   </div>
//                 </>
//               ) : item.errorFetchingDetails ? (
//                 <p>Error loading details for anime ID: {item.animeId}</p>
//               ) : (
//                 <p>Loading details for an anime...</p>
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
import Navbar from '../../Navbar'; // 1. IMPORT THE NAVBAR

const WatchlistPage = () => {
  const { watchlist, loadingWatchlistGlobal, errorWatchlistGlobal, updateWatchlistStatusGlobal, removeFromWatchlistGlobal } = useContext(WatchlistContext);
  
  const [detailedWatchlist, setDetailedWatchlist] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [errorDetails, setErrorDetails] = useState(null);

  useEffect(() => {
    if (!loadingWatchlistGlobal && watchlist && watchlist.length > 0) {
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
    } else if (!loadingWatchlistGlobal) {
      setDetailedWatchlist([]);
      setLoadingDetails(false);
    }
  }, [watchlist, loadingWatchlistGlobal]);

  const handleStatusChange = (animeId, newStatus) => {
    updateWatchlistStatusGlobal(animeId, newStatus);
  };

  const handleDelete = (animeId, animeTitle) => {
    if (window.confirm(`Are you sure you want to remove "${animeTitle}" from your watchlist?`)) {
      removeFromWatchlistGlobal(animeId);
    }
  };


  if (loadingWatchlistGlobal || loadingDetails) {
    // 2. Add Navbar to the loading state
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
    // 3. Add Navbar to the error state
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
    // 4. Wrap the main page content in a Fragment and add the Navbar
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