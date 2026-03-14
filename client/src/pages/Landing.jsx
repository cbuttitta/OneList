import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { user } = useAuth();

  return (
    <main className="landing">
      <h1>OneList</h1>
      <p>Create and share gift lists with the people you love.</p>
      <div className="landing-actions">
        {user ? (
          <Link to="/dashboard" className="btn">Go to my lists</Link>
        ) : (
          <>
            <Link to="/register" className="btn">Get started</Link>
            <Link to="/login" className="btn btn-secondary">Sign in</Link>
          </>
        )}
      </div>
    </main>
  );
}
