import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Navbar from "../components/Navbar";
import PasswordInput from "../components/PasswordInput";

const LIST_TYPES = [
  { value: "",           label: "None" },
  { value: "christmas",  label: "🎄 Christmas" },
  { value: "birthday",   label: "🎂 Birthday" },
];

export default function CreateList() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [listType, setListType] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const body = {
        name: name.trim(),
        description: description.trim() || undefined,
        list_type: listType || undefined,
        is_private: isPrivate,
      };
      if (isPrivate && passcode) body.passcode = passcode;
      const list = await api.lists.create(body);
      navigate(`/lists/${list.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form create-list-form">
        <Link to="/dashboard" className="back-link">&larr; Back to my lists</Link>
        <h2>New List</h2>
        {error && <p className="error">{error}</p>}

        <label className="field-label">
          List name
          <input
            type="text"
            placeholder="e.g. Birthday wishlist"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className="field-label">
          Description <span className="optional">(optional)</span>
          <textarea
            placeholder="What's this list for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>

        <div className="field-label">
          List Type
          <div className="type-options">
            {LIST_TYPES.map((t) => (
              <label key={t.value} className="type-option">
                <input
                  type="radio"
                  name="list_type"
                  value={t.value}
                  checked={listType === t.value}
                  onChange={() => setListType(t.value)}
                />
                {t.label}
              </label>
            ))}
          </div>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => { setIsPrivate(e.target.checked); if (!e.target.checked) setPasscode(""); }}
          />
          Make this list private (require a passcode to view)
        </label>

        {isPrivate && (
          <label className="field-label">
            Passcode
            <PasswordInput
              placeholder="Set a passcode for this list"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
            />
          </label>
        )}

        <button type="submit" className="btn">Create list</button>
      </form>
    </main>
    </>
  );
}
