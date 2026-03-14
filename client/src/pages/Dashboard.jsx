import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function Dashboard() {
  const [lists, setLists] = useState([]);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.lists.getAll().then(setLists).catch((e) => setError(e.message));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const list = await api.lists.create({ name: newName.trim() });
      setLists((prev) => [...prev, list]);
      setNewName("");
    } catch (e) {
      setError(e.message);
    }
  };

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

      <form onSubmit={handleCreate} className="new-list-form">
        <input
          type="text"
          placeholder="New list name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <button type="submit" className="btn">Create</button>
      </form>

      {lists.length === 0 ? (
        <p className="empty">No lists yet. Create one above!</p>
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
