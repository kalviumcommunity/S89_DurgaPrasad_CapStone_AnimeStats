
// import React from 'react';
// import './Navbar.css'; 
// function Navbar() {
//   return (
//     <nav className="navbar">
//       <div className="navbar-container">
//         <button className="back-button">←</button>
//         <h1 className="logo">ANIPULSE</h1>
//         <div className="navbar-links">
//           <a href="/news">News</a>
//           <a href="/stats">Stats</a>
//           <button className="user-icon">👤</button>
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;

import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button className="back-button">←</button>
        <h1 className="logo">ANIPULSE</h1>
        <div className="navbar-links">
          <a href="/news">News</a>
          <a href="/stats">Stats</a>
          <Link to="/watchlist">My Watchlist</Link> {/* <--- ADD THIS LINE */}
          <button className="user-icon">👤</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;