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
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (isAuthenticated) return <Navigate to={target} replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
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
      <div className="auth-card">
        {/* Left Side: Art Showcase */}
        <aside
          className="auth-showcase"
          style={{
            backgroundImage: "url('/photo-1549490349-8643362247b5.jpg')",
          }}
        >
          <div className="auth-showcase__overlay" />
          <div className="auth-showcase__content">
            <div>
              <div className="auth-showcase__badge">
                <span className="auth-showcase__badge-dot" />
                <span>Collector & Artist Portal</span>
              </div>
            </div>

            <div>
              <blockquote className="auth-showcase__quote">
                "Art enables us to find ourselves and lose ourselves at the same time."
                <cite className="auth-showcase__author">— Thomas Merton</cite>
              </blockquote>

              <div className="auth-showcase__features">
                <div className="auth-showcase__feature-item">
                  <span className="auth-showcase__feature-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </span>
                  <span>Museum-quality archival prints & canvases</span>
                </div>
                <div className="auth-showcase__feature-item">
                  <span className="auth-showcase__feature-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </span>
                  <span>Verified authenticity from global indie artists</span>
                </div>
                <div className="auth-showcase__feature-item">
                  <span className="auth-showcase__feature-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  </span>
                  <span>Insured carbon-neutral door-to-door delivery</span>
                </div>
              </div>
            </div>

            <div className="auth-showcase__caption">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>Featured: Contemporary Canvas Collection</span>
            </div>
          </div>
        </aside>

        {/* Right Side: Form Panel */}
        <section className="auth-panel">
          <header className="auth-header">
            <Link to="/" className="auth-header__brand" title="Return to home">
              <span className="auth-header__logo">Artify</span>
              <span className="auth-header__tag">Sign In</span>
            </Link>
            <h1>Welcome back</h1>
            <p>Enter your credentials to access your gallery, orders, and wishlist.</p>
          </header>

          {/* Error Banner */}
          {error && (
            <div className="auth-error-banner" role="alert" style={{ marginBottom: "1rem" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={onSubmit} className="auth-form" noValidate>
            {/* Email Field */}
            <div className="auth-label">
              <span className="auth-label-text">
                Email address <span style={{ color: "#C8FF00" }}>*</span>
              </span>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={`auth-input ${fieldErrors.email ? "auth-input--error" : ""}`}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              {fieldErrors.email && (
                <div className="auth-field-error">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{fieldErrors.email}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="auth-label">
              <span className="auth-label-text">
                Password <span style={{ color: "#C8FF00" }}>*</span>
              </span>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`auth-input auth-input--has-eye ${fieldErrors.password ? "auth-input--error" : ""}`}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-eye-btn"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <div className="auth-field-error">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{fieldErrors.password}</span>
                </div>
              )}
            </div>

            {/* Options Row */}
            <div className="auth-options">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotNotice(!showForgotNotice)}
                className="auth-link"
                style={{ background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}
              >
                Forgot password?
              </button>
            </div>

            {/* Forgot Password Helper Notice */}
            {showForgotNotice && (
              <div
                style={{
                  background: "rgba(200, 255, 0, 0.08)",
                  border: "1px dashed rgba(200, 255, 0, 0.3)",
                  borderRadius: "8px",
                  padding: "0.75rem 1rem",
                  fontSize: "0.8rem",
                  color: "#d4e8d8",
                  lineHeight: "1.4",
                }}
              >
                <div style={{ fontWeight: 600, color: "#C8FF00", marginBottom: "0.25rem" }}>
                  Resetting your password
                </div>
                Please contact our support team at <strong>support@artify.com</strong> or reach out via our contact page to receive a password reset link.
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="auth-submit-btn"
            >
              {isLoading ? (
                <>
                  <svg
                    className="auth-spinner"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>

            {/* Bottom Switch Link */}
            <footer className="auth-footer">
              Don't have an account?{" "}
              <Link to="/register" state={location.state}>
                Create an account
              </Link>
            </footer>

            {/* Security Guarantee */}
            <div className="auth-trust-badge">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>256-bit SSL encrypted • Private & Secure</span>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}