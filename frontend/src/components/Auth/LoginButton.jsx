import React from 'react';

const LoginButton = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:8080/auth/login';
  };

  return (
    <button onClick={handleLogin}>
      Login with MyAnimeList
    </button>
  );
};

export default LoginButton;