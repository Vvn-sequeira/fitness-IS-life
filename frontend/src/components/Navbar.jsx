import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { Activity, LogOut, LayoutDashboard, PlusCircle, Image as ImageIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Manage', path: '/manage', icon: <PlusCircle size={20} /> },
    { name: 'Gallery', path: '/gallery', icon: <ImageIcon size={20} /> },
  ];

  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1px' }}>
        <Activity color="var(--accent-neon)" size={28} />
        <h2 className="gradient-text" style={{ margin: 0 }}>FitTrack</h2>
      </Link>

      <div className="nav-links">
        {navItems.map(item => (
          <Link
            key={item.name}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              color: location.pathname === item.path ? 'var(--accent-neon)' : 'var(--text-secondary)'
            }}
          >
            {item.icon} {item.name}
          </Link>
        ))}
        <button className="btn" style={{ marginLeft: '0px', padding: '8px 16px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'red' }} onClick={handleLogout}>
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
