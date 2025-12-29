import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";
import Logo from "../assets/shilpeelogo1.png";

export default function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <Link to="/">
        <img src={Logo} alt="Shilpee Logo" className="logo"/>
      </Link>
      <nav>
        <ul className="nav-list">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/plays">Plays</Link></li>
          {isAuthenticated ? (
            <>
              <li><Link to="/profile">My Account</Link></li>
              {isAdmin && <li><Link to="/admin">Admin</Link></li>}
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
