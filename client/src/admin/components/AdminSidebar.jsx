import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <h2>Shilmanch</h2>
        <span>Admin</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="icon">📊</span>
          Dashboard
        </NavLink>
        <NavLink to="/admin/plays" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="icon">🎭</span>
          Plays
        </NavLink>
        <NavLink to="/admin/schedules" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="icon">📅</span>
          Schedules
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="icon">👥</span>
          Users
        </NavLink>
        <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="icon">🎟️</span>
          Orders
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/" className="back-to-site">
          <span className="icon">🏠</span>
          Back to Site
        </NavLink>
        <button onClick={handleLogout} className="logout-btn">
          <span className="icon">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
