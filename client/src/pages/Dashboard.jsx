import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function Dashboard() {
  const [lists, setLists] = useState([]);
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.lists.getAll().then(setLists).catch((e) => setError(e.message));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this list?")) return;
    try {
      await api.lists.delete(id);
      setLists((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  const shareUrl = (list) =>
    `${window.location.origin}/share/${list.share_token}`;

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>My Lists</h1>
        <button className="btn btn-secondary" onClick={() => { logout(); navigate("/"); }}>
          Sign out
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      <Link to="/lists/new" className="btn new-list-btn">+ New list</Link>

      {lists.length === 0 ? (
        <p className="empty">No lists yet. Create your first one!</p>
      ) : (
        <ul className="list-cards">
          {lists.map((list) => (
            <li key={list.id} className="list-card">
              <div className="list-card-info">
                <Link to={`/lists/${list.id}`} className="list-name">
                  {list.name}
                </Link>
                {list.is_private && <span className="badge">Private</span>}
              </div>
              <div className="list-card-actions">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => navigator.clipboard.writeText(shareUrl(list))}
                >
                  Copy link
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(list.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
