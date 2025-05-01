import React, { useEffect, useState } from 'react';
// ... other imports

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8080/api/user/me', {
          credentials: 'include', // Added this line
        });
        if (!response.ok) {
          console.error('Error fetching user:', response.status);
          setError('Could not fetch user information.');
        } else {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error('Network error fetching user:', err);
        setError('Network error.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogin = () => {
    // Redirect the user to your backend's /auth/login endpoint
    window.location.href = 'http://localhost:8080/auth/login';
  };

  return (
    <div>
      {/* Your Navbar */}
      <nav>
        {/* ... navigation links ... */}
        {user && user.malUsername && (
          <span>Logged in as: {user.malUsername}</span>
        )}
      </nav>

      {loading && <div>Loading user data...</div>}
      {error && <div>Error: {error}</div>}

      <main>
        <h1>CAPSTONE PROJECT</h1>
        {!user && !loading && !error && (
          <div>
            <p>Please log in to link your MyAnimeList account.</p>
            <button onClick={handleLogin}>Login with MyAnimeList</button>
            {/* Or you can use a link: */}
            {/* <a href="http://localhost:8080/auth/login">Login with MyAnimeList</a> */}
          </div>
        )}
        {user && user.malUsername && (
          <p>You are linked with MyAnimeList as: {user.malUsername}</p>
        )}
      </main>

      {/* Your footer */}
    </div>
  );
}

export default App;