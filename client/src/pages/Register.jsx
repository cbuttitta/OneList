import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const checks = [
  { label: "At least 8 characters",        test: (p) => p.length >= 8 },
  { label: "Uppercase letter (A–Z)",        test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase letter (a–z)",        test: (p) => /[a-z]/.test(p) },
  { label: "Number (0–9)",                  test: (p) => /\d/.test(p) },
  { label: "Special character (!@#$…)",     test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const allPassing = checks.every((c) => c.test(password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allPassing) { setTouched(true); return; }
    setError("");
    try {
      const data = await api.auth.register({ name, email, password });
      login(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Create account</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setTouched(true); }}
          required
        />
        {touched && (
          <ul className="password-checks">
            {checks.map((c) => (
              <li key={c.label} className={c.test(password) ? "check-pass" : "check-fail"}>
                {c.test(password) ? "✓" : "✗"} {c.label}
              </li>
            ))}
          </ul>
        )}
        <button type="submit" className="btn">Create account</button>
        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
