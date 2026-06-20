import { NavLink, useNavigate } from 'react-router-dom';
import { IoHomeOutline, IoImagesOutline, IoCalendarOutline,
         IoBookOutline, IoPencilOutline, IoHeartOutline,
         IoSearchOutline, IoSettingsOutline } from 'react-icons/io5';
import '../css/Sidebar.css';

const sidebarNavItems = [
  { label: 'Home',          path: '/',            icon: <IoHomeOutline /> },
  { label: 'Collections',   path: '/collections', icon: <IoImagesOutline /> },
  { label: 'Diary',         path: '/diary',       icon: <IoBookOutline /> },
  { label: 'Story Writing', path: '/stories',     icon: <IoPencilOutline /> },
  { label: 'Calendar',      path: '/calendar',    icon: <IoCalendarOutline /> },
  { label: 'Favorites',     path: '/favorites',   icon: <IoHeartOutline /> },
  { label: 'Search',        path: '/search',      icon: <IoSearchOutline /> },
  { label: 'Settings',      path: '/settings',    icon: <IoSettingsOutline /> },
];

function Sidebar({ user }) {
  const navigate = useNavigate();

  return (
    <aside className="sidebar-container">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">📖</span>
        <span className="sidebar-logo-text">MemoryVerse</span>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {sidebarNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? ' active' : ''}`
            }
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div
        className="sidebar-user-profile"
        onClick={() => navigate('/profile')}
        role="button"
        tabIndex={0}
      >
        <img
          src={user?.profileImage || 'https://ui-avatars.com/api/?name=User&background=c8a882&color=fff'}
          alt="Profile"
          className="sidebar-user-avatar"
        />
        <div>
          <div className="sidebar-user-name">
            Hello, {user?.name?.split(' ')[0] || 'Traveller'} ✨
          </div>
          <div className="sidebar-user-tagline">Explore your memories</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
