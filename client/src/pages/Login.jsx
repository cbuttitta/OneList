import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import PasswordInput from "../components/PasswordInput";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await api.auth.login({ email, password });
      login(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Sign in</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordInput
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn">Sign in</button>
        <p className="auth-link">
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </main>
  );
}
