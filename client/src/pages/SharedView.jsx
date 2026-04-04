import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import PasswordInput from "../components/PasswordInput";

const listEmoji = (type) =>
  type === "christmas" ? "🎄 " : type === "birthday" ? "🎂 " : "";

export default function SharedView() {
  const { token } = useParams();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [requiresPasscode, setRequiresPasscode] = useState(false);
  const [listName, setListName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [claimingItem, setClaimingItem] = useState(null); // item being claimed
  const [claimNote, setClaimNote] = useState("");
  const [claimError, setClaimError] = useState("");

  useEffect(() => {
    api.lists.getByToken(token)
      .then((data) => {
        if (data.requiresPasscode) {
          setRequiresPasscode(true);
          setListName(data.name);
        } else {
          setList(data);
          setItems(data.items || []);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handlePasscode = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await api.lists.verifyPasscode(token, passcode);
      setList(data);
      setItems(data.items || []);
      setRequiresPasscode(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const openClaim = (item) => {
    setClaimingItem(item);
    setClaimNote("");
    setClaimError("");
  };

  const submitClaim = async (status) => {
    try {
      const updated = await api.lists.claimItem(token, claimingItem.id, {
        status,
        claimer_note: claimNote.trim() || null,
      });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setClaimingItem(null);
    } catch (e) {
      setClaimError(e.message);
    }
  };

  const unclaim = async (item) => {
    try {
      const updated = await api.lists.claimItem(token, item.id, { status: "pending", claimer_note: null });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <p className="loading">Loading&hellip;</p>;
  if (error && !requiresPasscode) return <p className="error" style={{ padding: "2rem" }}>{error}</p>;

  if (requiresPasscode) {
    return (
      <main className="shared-view">
        <h1>{listName}</h1>
        <form onSubmit={handlePasscode} className="auth-form">
          <p>This list is private. Enter the passcode to view it.</p>
          {error && <p className="error">{error}</p>}
          <PasswordInput
            placeholder="Passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            required
          />
          <button type="submit" className="btn">View list</button>
        </form>
      </main>
    );
  }

  if (!list) return null;

  return (
    <main className="shared-view">
      <h1>{listEmoji(list.list_type)}{list.name}</h1>

      {items.length === 0 ? (
        <p className="empty">No items on this list yet.</p>
      ) : (
        <ul className="item-list">
          {items.map((item) => (
            <li key={item.id} className={`item ${item.status === "claimed" ? "claimed" : ""}`}>
              {item.image_data && (
                <img src={item.image_data} alt={item.title} className="item-image" />
              )}
              <div className="item-info">
                <div className="item-title-row">
                  <span className="item-title">{item.title}</span>
                  {item.quantity > 1 && <span className="item-qty">×{item.quantity}</span>}
                  {item.priority && (
                    <span className={`priority-badge priority-${item.priority}`}>{item.priority}</span>
                  )}
                </div>
                {item.price && <span className="item-price">{item.price}</span>}
                {item.description && <span className="item-desc">{item.description}</span>}
                {item.buy_link && (() => {
                  let host = "", name = "External Vendor";
                  try {
                    host = new URL(item.buy_link).hostname.replace(/^www\./, "");
                    const seg = host.split(".")[0];
                    name = seg.charAt(0).toUpperCase() + seg.slice(1);
                  } catch {}
                  return (
                    <a href={item.buy_link} target="_blank" rel="noopener noreferrer" className="item-buy-link">
                      Purchase from{" "}
                      {host && (
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${host}&sz=16`}
                          alt=""
                          onError={(e) => { e.target.style.display = "none"; }}
                          className="vendor-favicon"
                        />
                      )}
                      {name} ↗
                    </a>
                  );
                })()}
                {item.status === "claimed" && item.claimer_note && (
                  <span className="claimer-note">Note: {item.claimer_note}</span>
                )}
              </div>
              <div className="item-actions">
                {item.status === "claimed" ? (
                  <>
                    <span className="claimed-label">Claimed</span>
                    <button className="btn btn-sm btn-secondary" onClick={() => unclaim(item)}>
                      Unclaim
                    </button>
                  </>
                ) : (
                  <button className="btn btn-sm" onClick={() => openClaim(item)}>
                    Claim
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {claimingItem && (
        <div className="modal-overlay" onClick={() => setClaimingItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Claim "{claimingItem.title}"</h3>
            <p>Let others know this item is taken. Optionally leave a note (only visible on the shared page).</p>
            <label className="field-label">
              <span>Note <span className="optional">(optional)</span></span>
              <input
                type="text"
                placeholder="e.g. Getting this with Sarah"
                value={claimNote}
                onChange={(e) => setClaimNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitClaim("claimed")}
                autoFocus
              />
            </label>
            {claimError && <p className="error">{claimError}</p>}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setClaimingItem(null)}>Cancel</button>
              <button className="btn" onClick={() => submitClaim("claimed")}>Claim</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
