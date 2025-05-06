import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:8080/auth/session', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated);
          setUser(data);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsAuthenticated(false);
      } finally {
        setLoadingUser(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (loadingUser) {
    return <div>Checking authentication...</div>;
  }

  if (isAuthenticated === null || isAuthenticated === false) {
    return <div>You are not authenticated. Please log in.</div>;
  }

  return (
    <div>
      <h1>Welcome to your Dashboard!</h1>
      {user && (
        <>
          {user.googleName && <p>Logged in with Google as: {user.googleName}</p>}
          {user.googleEmail && <p>Google Email: {user.googleEmail}</p>}
          {user.malUsername && <p>Connected to MyAnimeList: {user.malUsername}</p>}
        </>
      )}
    </div>
  );
}

export default DashboardPage;
