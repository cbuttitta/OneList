import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";

const listEmoji = (type) =>
  type === "christmas" ? "🎄 " : type === "birthday" ? "🎂 " : "";

export default function ProfileView() {
  const { token } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.profile.get(token)
      .then(setProfile)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="loading">Loading&hellip;</p>;
  if (error) return <p className="error" style={{ padding: "2rem" }}>{error}</p>;
  if (!profile) return null;

  return (
    <main className="shared-view">
      <h1>{profile.name}'s Lists</h1>
      {profile.lists.length === 0 ? (
        <p className="empty">No public lists yet.</p>
      ) : (
        <ul className="list-cards">
          {profile.lists.map((list) => (
            <li key={list.id} className="list-card">
              <div className="list-card-info">
                <Link to={`/share/${list.share_token}`} className="list-name">
                  {listEmoji(list.list_type) && <span>{listEmoji(list.list_type)}</span>}
                  <span className="list-name-text">{list.name}</span>
                </Link>
              </div>
              <span className="list-item-count">
                {list.item_count} item{list.item_count !== 1 ? "s" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
