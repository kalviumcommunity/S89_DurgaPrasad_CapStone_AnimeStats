import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

// This variable is for DATA requests (like the login form). It's CORRECT.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ FIX: This is the NEW variable for browser redirect links (like Google login).
const BACKEND_DOMAIN = import.meta.env.VITE_BACKEND_DOMAIN;

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    // ✅ FIX: This now uses the new variable to build the correct link WITHOUT /api.
    // The final URL will be: https://...onrender.com/auth/google/login
    window.location.href = `${BACKEND_DOMAIN}/auth/google/login`;
  };

  const handleLocalLogin = async (event) => {
    event.preventDefault();
    setError('');

    try {
      // This is already correct. It uses API_BASE_URL to call the /api/... endpoint.
      const response = await axios.post(`${API_BASE_URL}/auth/local/login`, {
        identifier,
        password,
      });

      console.log('Local login successful:', response.data);
      navigate('/dashboard');

    } catch (err) {
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