import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoAddOutline, IoNotificationsOutline, IoSearchOutline } from 'react-icons/io5';
import '../css/Navbar.css';

// Map routes to display titles
const PAGE_TITLES = {
  '/':            'Your Journey, Your Memories',
  '/collections': 'Your Collections',
  '/diary':       'My Diary',
  '/stories':     'My Stories',
  '/calendar':    'Calendar Memories',
  '/favorites':   'Your Favorites',
  '/search':      'Search',
  '/profile':     'Profile & Settings',
  '/settings':    'Profile & Settings',
};

function Navbar({ pageTitle, onAddMemory }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate  = useNavigate();
  const location  = useLocation();

  // Use passed pageTitle or derive from route
  const title = pageTitle || PAGE_TITLES[location.pathname] || 'MemoryVerse';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="navbar-container">
      <h1 className="navbar-page-title">{title}</h1>

      <div className="navbar-actions">
        {/* Search */}
        <form onSubmit={handleSearchSubmit}>
          <div className="navbar-search-bar">
            <IoSearchOutline style={{ color: '#c8a882', fontSize: '16px', flexShrink: 0 }} />
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search memories"
            />
          </div>
        </form>

        {/* Add Memory */}
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
          aria-label="Notifications"
          onClick={() => {}}
        >
          <IoNotificationsOutline />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
