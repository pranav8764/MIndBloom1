import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>MindBloom</h1>
          </Link>
        </div>
        
        <div className="mobile-menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            <li><Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link></li>
            <li><Link to="/journal" onClick={() => setIsMenuOpen(false)}>Journal</Link></li>
            <li><Link to="/challenges" onClick={() => setIsMenuOpen(false)}>Challenges</Link></li>
            <li><Link to="/achievements" onClick={() => setIsMenuOpen(false)}>Achievements</Link></li>
            <li><Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;