import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">OneList</Link>
      {user && (
        <div className="navbar-right">
          <span className="navbar-user">
            Logged in as <strong>{user.name}</strong>
          </span>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => { logout(); navigate("/"); }}
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
