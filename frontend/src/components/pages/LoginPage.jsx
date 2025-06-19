import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // ✅ FIX #1: Imported axios for consistency
import './LoginPage.css';

// This is already using the correct "master key" method. Perfect.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // This function is correct for an OAuth redirect flow. No changes needed.
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google/login`;
  };

  // ✅ FIX #2: Converted this function to use axios.
  const handleLocalLogin = async (event) => {
    event.preventDefault();
    setError('');

    try {
      // axios.post is cleaner. It will automatically use the global `withCredentials` setting.
      const response = await axios.post(`${API_BASE_URL}/auth/local/login`, {
        identifier,
        password,
      });

      // On success (status 2xx), this code will run.
      console.log('Local login successful:', response.data);
      navigate('/dashboard'); // Or wherever your main app page is

    } catch (err) {
      // On failure (status 4xx or 5xx), axios throws an error, which is caught here.
      console.error('Error during local login:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>

        <button className="google-btn" onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
        <hr />

        <h3>Login with Username/Email</h3>
        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleLocalLogin}>
          <div className="form-group">
            <label htmlFor="identifier">Username or Email:</label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;