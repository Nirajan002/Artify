import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../features/auth/authApi";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage, getFieldErrors } from "../utils/errors";

export default function Register() {
  const [register, { isLoading }] = useRegisterMutation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string; search?: string } })?.from;
  const target = from ? `${from.pathname}${from.search ?? ""}` : "/";

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phoneNumber: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (isAuthenticated) return <Navigate to={target} replace />;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setFieldErrors({});
    try {
      await register({ ...form, phoneNumber: form.phoneNumber || undefined }).unwrap();
      navigate(target, { replace: true });
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setError(getErrorMessage(err));
    }
  };

  const F = ({ k, label, type = "text", auto }: { k: keyof typeof form; label: string; type?: string; auto?: string }) => (
    <label className="field">
      <span>{label}</span>
      <input type={type} autoComplete={auto} value={form[k]} onChange={set(k)} />
      {fieldErrors[k] && <small className="error">{fieldErrors[k]}</small>}
    </label>
  );

  return (
    <main className="auth-page">
      <form onSubmit={onSubmit} className="auth-form" noValidate>
        <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
          <Link to="/" style={{ fontSize: "1.5rem", fontWeight: 800, color: "#C8FF00", letterSpacing: "-0.5px" }}>
            Artify
          </Link>
        </div>
        <h1 style={{ textAlign: "center", fontSize: "1.5rem", marginBottom: "0.25rem" }}>Create your account</h1>
        <p className="muted" style={{ textAlign: "center", marginBottom: "1rem" }}>Join the Artify community</p>

        {F({ k: "firstName", label: "First name", auto: "given-name" })}
        {F({ k: "lastName", label: "Last name", auto: "family-name" })}
        {F({ k: "email", label: "Email", type: "email", auto: "email" })}
        {F({ k: "phoneNumber", label: "Phone (optional)", type: "tel", auto: "tel" })}
        {F({ k: "password", label: "Password (8+ chars, a capital & number)", type: "password", auto: "new-password" })}

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" disabled={isLoading} style={{ width: "100%", padding: "0.8rem", fontSize: "1rem" }}>
          {isLoading ? "Creating…" : "Register"}
        </button>

        <p style={{ textAlign: "center", color: "#5a8070", fontSize: "0.875rem" }}>
          Already have an account? <Link to="/login" state={location.state} style={{ color: "#C8FF00" }}>Log in</Link>
        </p>
      </form>
    </main>
  );
}