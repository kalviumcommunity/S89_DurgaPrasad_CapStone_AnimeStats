// import React, { useEffect, useState } from 'react';
// import './StatsPage.css';
// import axios from 'axios';
// import {
//   PieChart, Pie, Cell,
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
//   ResponsiveContainer
// } from 'recharts';
// import './StatsPage.css';

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF2'];

// const StatsPage = () => {
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const response = await axios.get('/api/stats');
//         setStats(response.data);
//       } catch (err) {
//         console.error(err);
//         setError('Failed to fetch stats');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStats();
//   }, []);

//   if (loading) return <p>Loading stats...</p>;
//   if (error) return <p>{error}</p>;

//   const statusData = Object.entries(stats.statusCounts).map(([status, count]) => ({
//     name: status.replace('_', ' ').toUpperCase(),
//     value: count
//   }));

//   return (
//     <div className="stats-page">
//       <h1>My Anime Stats</h1>
//       <p><strong>Total Episodes Watched:</strong> {stats.totalEpisodesWatched}</p>

//       <div className="chart-section">
//         <h2>Status Distribution</h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <PieChart>
//             <Pie
//               data={statusData}
//               dataKey="value"
//               nameKey="name"
//               cx="50%"
//               cy="50%"
//               outerRadius={100}
//               fill="#8884d8"
//               label
//             >
//               {statusData.map((entry, index) => (
//                 <Cell key={index} fill={COLORS[index % COLORS.length]} />
//               ))}
//             </Pie>
//             <Tooltip />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>

//       <div className="chart-section">
//         <h2>Top Genres</h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={stats.topGenres}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis allowDecimals={false} />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="count" fill="#00C49F" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       <div className="chart-section">
//         <h2>Top Studios</h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={stats.topStudios}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis allowDecimals={false} />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="count" fill="#FF8042" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default StatsPage;

import React, { useEffect, useState, useCallback } from 'react'; // 1. Import useCallback
import axios from 'axios';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import './StatsPage.css';
import Navbar from '../../Navbar';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF2'];

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 2. THE FIX STARTS HERE ---
  // Wrap the data fetching logic in useCallback. This is a performance optimization
  // that ensures the function isn't recreated on every render.
  const fetchStats = useCallback(async () => {
    try {
      // Set loading to true each time we fetch for a better user experience
      setLoading(true); 
      const response = await axios.get('/api/stats');
      setStats(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []); // The empty dependency array means this function itself is stable

  useEffect(() => {
    // A. Fetch stats when the component first loads
    fetchStats();

    // B. Add an event listener to re-fetch when the user returns to this tab/window
    window.addEventListener('focus', fetchStats);

    // C. This is a cleanup function. It removes the listener when you navigate
    //    away from the page, which prevents memory leaks.
    return () => {
      window.removeEventListener('focus', fetchStats);
    };
  }, [fetchStats]); // This effect will now re-run only if fetchStats changes (which it won't)


  if (loading) {
    return (
      <>
        <Navbar />
        <div className="stats-page">
          <p className="loading-message">Loading stats...</p>
        </div>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Navbar />
        <div className="stats-page">
          <p className="error-message">{error}</p>
        </div>
      </>
    );
  }
  
  if (!stats || !stats.statusCounts) {
    return (
        <>
            <Navbar />
            <div className="stats-page">
                <p>No stats available. Add some anime to your watchlist!</p>
            </div>
        </>
    )
  }

  const statusData = Object.entries(stats.statusCounts).map(([status, count]) => ({
    name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count
  }));

  return (
    <>
      <Navbar />
      <div className="stats-page">
        <h1>My Anime Stats</h1>
        <p className="total-episodes-stat">
          Total Episodes Watched: <strong>{stats.totalEpisodesWatched || 0}</strong>
        </p>

        <div className="chart-section">
          <h2>Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={100} fill="#8884d8" label
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section">
          <h2>Top Genres</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topGenres}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section">
          <h2>Top Studios</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topStudios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default StatsPage;