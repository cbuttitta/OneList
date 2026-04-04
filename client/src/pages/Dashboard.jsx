import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [archivedLists, setArchivedLists] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [profileToken, setProfileToken] = useState(null);
  const [profileCopied, setProfileCopied] = useState(false);

  useEffect(() => {
    api.lists.getAll().then(setLists).catch((e) => setError(e.message));
    api.profile.getMe().then((u) => setProfileToken(u.profile_token)).catch(() => {});
  }, []);

  const loadArchived = async () => {
    if (archivedLists.length === 0) {
      const archived = await api.lists.getArchived().catch(() => []);
      setArchivedLists(archived);
    }
    setShowArchived((v) => !v);
  };

  const handleDuplicate = async (id) => {
    try {
      const newList = await api.lists.duplicate(id);
      setLists((prev) => [...prev, { ...newList, item_count: 0 }]);
      navigate(`/lists/${newList.id}`);
    } catch (e) {
      setError(e.message);
    }
  };

  const shareUrl = (list) => `${window.location.origin}/share/${list.share_token}`;

  const copyProfileLink = () => {
    if (!profileToken) return;
    navigator.clipboard.writeText(`${window.location.origin}/profile/${profileToken}`);
    setProfileCopied(true);
    setTimeout(() => setProfileCopied(false), 1500);
  };

  const listEmoji = (type) =>
    type === "christmas" ? "🎄 " : type === "birthday" ? "🎂 " : "";

  const filtered = lists.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main className="dashboard">
        <header className="dashboard-header">
          <h1>My Lists</h1>
          <button className="btn btn-secondary btn-sm" onClick={copyProfileLink}>
            {profileCopied ? "Copied!" : "Share Profile 🔗"}
          </button>
        </header>

        {error && <p className="error">{error}</p>}

        <div className="dashboard-toolbar">
          <Link to="/lists/new" className="btn new-list-btn">+ New List</Link>
          <input
            type="text"
            className="search-input"
            placeholder="Search lists…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 && search ? (
          <p className="empty">No lists match "{search}".</p>
        ) : filtered.length === 0 ? (
          <p className="empty">No lists yet. Create your first one!</p>
        ) : (
          <ul className="list-cards">
            {filtered.map((list) => (
              <li key={list.id} className="list-card">
                <div className="list-card-info">
                  <Link to={`/lists/${list.id}`} className="list-name">
                    {listEmoji(list.list_type) && <span>{listEmoji(list.list_type)}</span>}
                    <span className="list-name-text">{list.name}</span>
                  </Link>
                  {list.is_private && <span className="badge">Private</span>}
                  <span className="list-item-count">{list.item_count} item{list.item_count !== 1 ? "s" : ""}</span>
                </div>
                <div className="list-card-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleDuplicate(list.id)}
                  >
                    Duplicate
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl(list));
                      setCopiedId(list.id);
                      setTimeout(() => setCopiedId(null), 1500);
                    }}
                  >
                    {copiedId === list.id ? "Copied!" : "Copy link"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="archived-toggle">
          <button className="btn-text" onClick={loadArchived}>
            {showArchived ? "▲ Hide archived" : "▼ Show archived lists"}
          </button>
        </div>

        {showArchived && (
          archivedLists.length === 0 ? (
            <p className="empty" style={{ paddingTop: "0.5rem" }}>No archived lists.</p>
          ) : (
            <ul className="list-cards archived-cards">
              {archivedLists.map((list) => (
                <li key={list.id} className="list-card list-card-archived">
                  <div className="list-card-info">
                    <Link to={`/lists/${list.id}`} className="list-name">
                      {listEmoji(list.list_type) && <span>{listEmoji(list.list_type)}</span>}
                      <span className="list-name-text">{list.name}</span>
                    </Link>
                    <span className="badge badge-archived">Archived</span>
                    <span className="list-item-count">{list.item_count} item{list.item_count !== 1 ? "s" : ""}</span>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}

        {copiedId && <div className="copied-toast">Link copied!</div>}
        {profileCopied && <div className="copied-toast">Profile link copied!</div>}
      </main>
    </>
  );
}
