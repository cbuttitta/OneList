import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import PasswordInput from "../components/PasswordInput";

export default function SharedView() {
  const { token } = useParams();
  const [list, setList] = useState(null);
  const [requiresPasscode, setRequiresPasscode] = useState(false);
  const [listName, setListName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.lists.getByToken(token)
      .then((data) => {
        if (data.requiresPasscode) {
          setRequiresPasscode(true);
          setListName(data.name);
        } else {
          setList(data);
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
      setRequiresPasscode(false);
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <p className="loading">Loading&hellip;</p>;

  if (error && !requiresPasscode) return <p className="error">{error}</p>;

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
      <h1>{list.name}</h1>
      {list.items && list.items.length === 0 ? (
        <p className="empty">No items on this list yet.</p>
      ) : (
        <ul className="item-list">
          {(list.items || []).map((item) => (
            <li key={item.id} className={`item ${item.status === "claimed" ? "claimed" : ""}`}>
              <div className="item-info">
                <span className="item-title">{item.title}</span>
                {item.description && <span className="item-desc">{item.description}</span>}
              </div>
              <span className="item-status">{item.status === "claimed" ? "Claimed" : "Available"}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
