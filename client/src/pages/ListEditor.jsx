import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import Navbar from "../components/Navbar";

export default function ListEditor() {
  const { id } = useParams();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.lists.getOne(id).then((data) => {
      setList(data);
      setItems(data.items || []);
      setIsPrivate(data.is_private);
      setNameInput(data.name);
    }).catch((e) => setError(e.message));
  }, [id]);

  const saveSettings = async () => {
    try {
      const body = { name: nameInput, is_private: isPrivate };
      if (passcode) body.passcode = passcode;
      else if (!isPrivate) body.passcode = null;
      const updated = await api.lists.update(id, body);
      setList(updated);
      setPasscode("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.message);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const item = await api.items.create(id, { title: newTitle.trim(), description: newDesc.trim() });
      setItems((prev) => [...prev, item]);
      setNewTitle("");
      setNewDesc("");
    } catch (e) {
      setError(e.message);
    }
  };

  const toggleStatus = async (item) => {
    const status = item.status === "claimed" ? "pending" : "claimed";
    try {
      const updated = await api.items.update(id, item.id, { status });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await api.items.delete(id, itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (e) {
      setError(e.message);
    }
  };

  const shareUrl = list ? `${window.location.origin}/share/${list.share_token}` : "";

  if (!list) return <><Navbar /><p className="loading">Loading&hellip;</p></>;

  return (
    <>
      <Navbar />
      <main className="list-editor">
      <Link to="/dashboard" className="back-link">&larr; My lists</Link>

      {error && <p className="error">{error}</p>}

      <section className="editor-header">
        {editingName ? (
          <div className="name-edit">
            <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
            <button className="btn" onClick={() => { saveSettings(); setEditingName(false); }}>Save</button>
            <button className="btn btn-secondary" onClick={() => setEditingName(false)}>Cancel</button>
          </div>
        ) : (
          <h1 onClick={() => setEditingName(true)} title="Click to rename">{list.name}</h1>
        )}
      </section>

      <section className="share-settings">
        <h2>Share settings</h2>
        <label>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          {" "}Require passcode to view
        </label>
        {isPrivate && (
          <input
            type="password"
            placeholder="Set new passcode (leave blank to keep existing)"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
          />
        )}
        <div className="share-row">
          <input readOnly value={shareUrl} className="share-url" />
          <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(shareUrl)}>
            Copy link
          </button>
        </div>
        <button className="btn" onClick={saveSettings}>
          {saved ? "Saved!" : "Save settings"}
        </button>
      </section>

      <section className="items-section">
        <h2>Items</h2>
        <form onSubmit={addItem} className="add-item-form">
          <input
            type="text"
            placeholder="Item title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <button type="submit" className="btn">Add item</button>
        </form>

        {items.length === 0 ? (
          <p className="empty">No items yet.</p>
        ) : (
          <ul className="item-list">
            {items.map((item) => (
              <li key={item.id} className={`item ${item.status === "claimed" ? "claimed" : ""}`}>
                <div className="item-info">
                  <span className="item-title">{item.title}</span>
                  {item.description && <span className="item-desc">{item.description}</span>}
                </div>
                <div className="item-actions">
                  <button className="btn btn-sm btn-secondary" onClick={() => toggleStatus(item)}>
                    {item.status === "claimed" ? "Unclaim" : "Claim"}
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteItem(item.id)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
    </>
  );
}
