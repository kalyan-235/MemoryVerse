import { NavLink, useLocation } from 'react-router-dom';
import {
  IoHomeOutline,      IoHome,
  IoImagesOutline,    IoImages,
  IoBookOutline,      IoBook,
  IoPencilOutline,    IoPencil,
  IoPersonOutline,    IoPerson,
} from 'react-icons/io5';
import '../css/Mobile.css';

const AUTH_ROUTES = ['/login', '/register', '/welcome', '/forgot-password', '/verify-otp', '/reset-password'];

const NAV_ITEMS = [
  { path:'/',            label:'Home',       icon:<IoHomeOutline />,    activeIcon:<IoHome />,    end:true },
  { path:'/collections', label:'Collections', icon:<IoImagesOutline />, activeIcon:<IoImages /> },
  { path:'/diary',       label:'Diary',       icon:<IoBookOutline />,   activeIcon:<IoBook /> },
  { path:'/stories',     label:'Stories',     icon:<IoPencilOutline />, activeIcon:<IoPencil /> },
  { path:'/profile',     label:'Profile',     icon:<IoPersonOutline />, activeIcon:<IoPerson /> },
];

function MobileBottomNav() {
  const location = useLocation();

  // Hide on auth pages and memory detail
  if (AUTH_ROUTES.includes(location.pathname)) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="Main navigation">
      <div className="mobile-bottom-nav-inner">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `mobile-nav-item${isActive ? ' active' : ''}`
            }
            aria-label={item.label}
          >
            {({ isActive }) => (
              <>
                {isActive ? item.activeIcon : item.icon}
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
