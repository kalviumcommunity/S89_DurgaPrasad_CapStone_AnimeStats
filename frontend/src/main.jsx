import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios'; // ✅ Import Axios

// ✅ Global Axios Configuration
axios.defaults.withCredentials = true; // Always send session cookies
axios.defaults.baseURL = 'http://localhost:8080'; // Base API URL

console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
