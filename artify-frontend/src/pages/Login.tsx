import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../features/auth/authApi";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage, getFieldErrors } from "../utils/errors";

export default function Login() {
  const [login, { isLoading }] = useLoginMutation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string; search?: string } })?.from;
  const target = from ? `${from.pathname}${from.search ?? ""}` : "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (isAuthenticated) return <Navigate to={target} replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setFieldErrors({});
    try {
      await login(form).unwrap();
      navigate(target, { replace: true });
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setError(getErrorMessage(err));
    }
  };

  return (
    <main className="auth-page">
      <form onSubmit={onSubmit} className="auth-form">
        <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
          <Link to="/" style={{ fontSize: "1.5rem", fontWeight: 800, color: "#C8FF00", letterSpacing: "-0.5px" }}>
            Artify
          </Link>
        </div>
        <h1 style={{ textAlign: "center", fontSize: "1.5rem", marginBottom: "0.25rem" }}>Welcome back</h1>
        <p className="muted" style={{ textAlign: "center", marginBottom: "1rem" }}>Sign in to your account</p>

        <label className="field">
          <span>Email</span>
          <input type="email" autoComplete="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          {fieldErrors.email && <small className="error">{fieldErrors.email}</small>}
        </label>

        <label className="field">
          <span>Password</span>
          <input type="password" autoComplete="current-password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" disabled={isLoading} style={{ width: "100%", padding: "0.8rem", fontSize: "1rem" }}>
          {isLoading ? "Signing in…" : "Log in"}
        </button>

        <p style={{ textAlign: "center", color: "#5a8070", fontSize: "0.875rem" }}>
          New to Artify? <Link to="/register" state={location.state} style={{ color: "#C8FF00" }}>Create an account</Link>
        </p>
      </form>
    </main>
  );
}