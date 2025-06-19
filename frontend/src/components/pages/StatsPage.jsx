import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import './StatsPage.css';
import Navbar from '../../Navbar';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF2'];

// ✅ This is already using the correct "master key" method.
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);

      // ✅ FIX: Removed '/api' and the redundant 'withCredentials' object.
      // This is now clean and consistent with all other API calls.
      const response = await axios.get(`${BASE_URL}/stats`);

      setStats(response.data);
      setError(null); // Clear previous errors on a successful fetch
    } catch (err) {
      console.error('Failed to fetch stats:', err.response?.data || err.message);
      setError('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []); // The dependency array is empty because BASE_URL is a constant within the component's scope.

  useEffect(() => {
    fetchStats();
    // This is a nice feature to re-fetch when the user returns to the tab.
    window.addEventListener('focus', fetchStats);
    return () => {
      window.removeEventListener('focus', fetchStats);
    };
  }, [fetchStats]);

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
    );
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