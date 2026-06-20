import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoAddOutline, IoNotificationsOutline, IoSearchOutline } from 'react-icons/io5';
import '../css/Navbar.css';

function Navbar({ pageTitle, onAddMemory }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="navbar-container">
      <h1 className="navbar-page-title">{pageTitle || 'MemoryVerse'}</h1>

      <div className="navbar-actions">
        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit}>
          <div className="navbar-search-bar">
            <IoSearchOutline style={{ color: '#c8a882', fontSize: '16px' }} />
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search memories"
            />
          </div>
        </form>

        {/* Add Memory Button */}
        <button
          className="navbar-add-memory-btn"
          onClick={onAddMemory}
          aria-label="Add new memory"
        >
          <IoAddOutline size={18} />
          Add Memory
        </button>

        {/* Notifications */}
        <button
          className="navbar-notification-btn"
          aria-label="View notifications"
        >
          <IoNotificationsOutline />
          <span className="navbar-notification-badge">3</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
