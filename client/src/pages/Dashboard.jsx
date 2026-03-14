import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [lists, setLists] = useState([]);
  const [error, setError] = useState("");

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
    <>
      <Navbar />
      <main className="dashboard">
      <header className="dashboard-header">
        <h1>My Lists</h1>
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
    </>
  );
}
