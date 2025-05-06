// import { GoogleLogin } from '@react-oauth/google';

// const LoginPage = () => {
//   const handleSuccess = async (credentialResponse) => {
//     try {
//       const code = credentialResponse.code; // Only available with 'auth-code' flow
//       console.log('Google OAuth Code:', code); // Log the code for debugging

//       if (!code) {
//         console.error('No code received');
//         return;
//       }

//       // Redirect to backend with the auth code
//       // Ensure the backend is ready to handle this properly
//       window.location.href = `http://localhost:8080/auth/google/callback?code=${code}`;
//     } catch (err) {
//       console.error('Login failed:', err);
//     }
//   };

//   const handleError = (error) => {
//     console.error('Google Login Failed:', error);
//   };

//   return (
//     <div>
//       <h2>Login with Google</h2>
//       <GoogleLogin
//         onSuccess={handleSuccess}
//         onError={handleError}
//         useOneTap // Optional: enable the one-tap login
//         flow="auth-code" // Specify auth code flow
//         ux_mode="redirect" // Redirect the user after successful login
//         redirect_uri="http://localhost:8080/auth/google/callback" // Your backend callback URL
//       />
//     </div>
//   );
// };

// export default LoginPage;

const LoginPage = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/auth/google/login';
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
      {/* ... other login options ... */}
    </div>
  );
};

export default LoginPage;