import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MainContent() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState(null);
  const [animeList, setAnimeList] = useState([]);
  const [loadingAnimeList, setLoadingAnimeList] = useState(false);
  const [errorAnimeList, setErrorAnimeList] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      setLoadingUser(true);
      setErrorUser(null);
      try {
        const response = await fetch('http://localhost:8080/api/user/me', {
          credentials: 'include',
        });
        if (!response.ok) {
          console.error('Error fetching user:', response.status);
          setErrorUser('Could not fetch user information.');
        } else {
          const userData = await response.json();
          console.log('Fetched User Data:', userData);
          setUser(userData);
        }
      } catch (err) {
        console.error('Network error fetching user:', err);
        setErrorUser('Network error.');
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const fetchAnimeListData = async () => {
    setLoadingAnimeList(true);
    setErrorAnimeList(null);
    try {
      const response = await fetch('http://localhost:8080/api/user/animelist', {
        credentials: 'include',
      });
      if (!response.ok) {
        console.error('Error fetching anime list:', response.status);
        const errorData = await response.json();
        setErrorAnimeList(errorData.message || 'Failed to fetch anime list.');
        return;
      }
      const data = await response.json();
      setAnimeList(data.data || []);
    } catch (err) {
      console.error('Network error fetching anime list:', err);
      setErrorAnimeList('Network error fetching anime list.');
    } finally {
      setLoadingAnimeList(false);
    }
  };

  console.log('User:', user);
  console.log('loadingUser:', loadingUser);
  console.log('errorUser:', errorUser);

  return (
    <div>
      <nav>
        {user && user.malUsername && (
          <span>Logged in as: {user.malUsername}</span>
        )}
      </nav>

      {loadingUser && <div>Loading user data...</div>}
      {errorUser && <div>Error: {errorUser}</div>}

      <main>
        <h1>CAPSTONE PROJECT</h1>

        {!user && !loadingUser && !errorUser && (
          <div>
            <p>Please log in to link your MyAnimeList account.</p>
            <button onClick={() => navigate('/login')}>Go to Login</button>
          </div>
        )}

        {user && !user.malUsername && !loadingUser && !errorUser && (
          <div>
            <p>Welcome! To get your MyAnimeList, please connect your account.</p>
            <button onClick={() => navigate('/login')}>Go to Login</button>
          </div>
        )}

        {user?.malUsername && (
          <div>
            <p>You are linked with MyAnimeList as: {user.malUsername}</p>
            <button onClick={fetchAnimeListData}>Fetch Anime List</button>
            {loadingAnimeList ? (
              <div>Loading anime list...</div>
            ) : errorAnimeList ? (
              <div>Error fetching anime list: {errorAnimeList}</div>
            ) : animeList.length > 0 ? (
              <div>
                <h2>Your Anime List</h2>
                <ul>
                  {animeList.map(item => (
                    <li key={item.node.id}>
                      {item.node.title}
                      {item.node.main_picture && (
                        <img
                          src={item.node.main_picture.medium}
                          alt={item.node.title}
                          style={{ maxWidth: '50px', marginRight: '10px' }}
                        />
                      )}
                      <p>Status: {item.list_status.status}</p>
                      <p>Episodes Watched: {item.list_status.num_episodes_watched}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>Your anime list is empty or could not be loaded.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default MainContent;