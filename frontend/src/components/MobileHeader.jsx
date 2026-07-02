import { useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  IoSearchOutline, IoAddOutline, IoArrowBackOutline,
  IoCloseOutline,
} from 'react-icons/io5';
import '../css/Mobile.css';

const ROUTE_TITLES = {
  '/':            null,            // shows logo
  '/collections': 'Collections',
  '/diary':       'My Diary',
  '/stories':     'My Stories',
  '/calendar':    'Calendar',
  '/favorites':   'Favorites',
  '/search':      'Search',
  '/profile':     'Profile',
  '/settings':    'Settings',
};

function MobileHeader({ onAddMemory, pageTitle }) {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery]           = useState('');
  const navigate  = useNavigate();
  const location  = useLocation();

  const isMemoryDetail  = location.pathname.startsWith('/memory/');
  const isAuth = ['/login','/register','/welcome','/forgot-password','/verify-otp','/reset-password'].includes(location.pathname);

  if (isAuth) return null; // no header on auth pages

  const routeTitle = ROUTE_TITLES[location.pathname];
  const isHome     = location.pathname === '/';
  const title      = pageTitle || routeTitle;

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setShowSearch(false);
    }
  };

  return (
    <header className="mobile-header">
      <div className="mobile-header-top">

        {/* Left */}
        {isMemoryDetail ? (
          <button
            className="mobile-icon-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <IoArrowBackOutline />
          </button>
        ) : isHome ? (
          <NavLink to="/" className="mobile-header-logo" style={{ textDecoration:'none' }}>
            <span style={{ fontSize:'22px' }}>📖</span>
            <span>MemoryVerse</span>
          </NavLink>
        ) : (
          <h1 className="mobile-header-title">{title}</h1>
        )}

        {/* Right actions */}
        <div className="mobile-header-actions">
          {!showSearch && (
            <button
              className="mobile-icon-btn"
              onClick={() => setShowSearch(true)}
              aria-label="Search"
            >
              <IoSearchOutline />
            </button>
          )}

          {showSearch && (
            <button
              className="mobile-icon-btn"
              onClick={() => { setShowSearch(false); setQuery(''); }}
              aria-label="Close search"
            >
              <IoCloseOutline />
            </button>
          )}

          <button className="mobile-add-btn" onClick={onAddMemory} aria-label="Add memory">
            <IoAddOutline size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Expandable search */}
      {showSearch && (
        <div className="mobile-search-row">
          <form onSubmit={handleSearch}>
            <div className="mobile-search-bar">
              <IoSearchOutline style={{ color:'#c8a882', flexShrink:0 }} />
              <input
                type="search"
                className="mobile-search-input"
                placeholder="Search memories, diary, stories..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
                aria-label="Search"
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}

export default MobileHeader;
