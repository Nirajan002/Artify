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

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (isAuthenticated) return <Navigate to={target} replace />;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  // Live password validation criteria matching backend FluentValidation rules
  const hasMinLength = form.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    try {
      await register({
        ...form,
        phoneNumber: form.phoneNumber.trim() || undefined,
      }).unwrap();
      navigate(target, { replace: true });
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setError(getErrorMessage(err));
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card auth-card--register">
        {/* Left Side: Art Showcase */}
        <aside
          className="auth-showcase"
          style={{
            backgroundImage: "url('/photo-1464822759023-fed622ff2c3b.jpg')",
          }}
        >
          <div className="auth-showcase__overlay" />
          <div className="auth-showcase__content">
            <div>
              <div className="auth-showcase__badge">
                <span className="auth-showcase__badge-dot" />
                <span>Join Artify Community</span>
              </div>
            </div>

            <div>
              <blockquote className="auth-showcase__quote">
                "Every artist was first an amateur. Creativity takes courage."
                <cite className="auth-showcase__author">— Henri Matisse</cite>
              </blockquote>

              <div className="auth-showcase__features">
                <div className="auth-showcase__feature-item">
                  <span className="auth-showcase__feature-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 19l7-7 3 3-7 7-3-3z" />
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                      <path d="M2 2l7.586 7.586" />
                      <circle cx="11" cy="11" r="2" />
                    </svg>
                  </span>
                  <span>List your artwork & reach collectors worldwide</span>
                </div>
                <div className="auth-showcase__feature-item">
                  <span className="auth-showcase__feature-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </span>
                  <span>Turn your digital art into custom physical prints</span>
                </div>
                <div className="auth-showcase__feature-item">
                  <span className="auth-showcase__feature-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </span>
                  <span>Save favorites, track orders, and leave verified reviews</span>
                </div>
              </div>
            </div>

            <div className="auth-showcase__caption">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>Featured: Alpine Vista Series • Fine Art Giclée</span>
            </div>
          </div>
        </aside>

        {/* Right Side: Form Panel */}
        <section className="auth-panel">
          <header className="auth-header">
            <Link to="/" className="auth-header__brand" title="Return to home">
              <span className="auth-header__logo">Artify</span>
              <span className="auth-header__tag">Register</span>
            </Link>
            <h1>Create your account</h1>
            <p>Join our thriving community of independent artists and art collectors.</p>
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
            {/* First Name & Last Name Side-by-Side */}
            <div className="auth-field-grid">
              <div className="auth-label">
                <span className="auth-label-text">
                  First name <span style={{ color: "#C8FF00" }}>*</span>
                </span>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    autoComplete="given-name"
                    placeholder="Jane"
                    className={`auth-input ${fieldErrors.firstName ? "auth-input--error" : ""}`}
                    value={form.firstName}
                    onChange={set("firstName")}
                    required
                  />
                </div>
                {fieldErrors.firstName && (
                  <div className="auth-field-error">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{fieldErrors.firstName}</span>
                  </div>
                )}
              </div>

              <div className="auth-label">
                <span className="auth-label-text">
                  Last name <span style={{ color: "#C8FF00" }}>*</span>
                </span>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    autoComplete="family-name"
                    placeholder="Doe"
                    className={`auth-input ${fieldErrors.lastName ? "auth-input--error" : ""}`}
                    value={form.lastName}
                    onChange={set("lastName")}
                    required
                  />
                </div>
                {fieldErrors.lastName && (
                  <div className="auth-field-error">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{fieldErrors.lastName}</span>
                  </div>
                )}
              </div>
            </div>

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
                  placeholder="jane.doe@example.com"
                  className={`auth-input ${fieldErrors.email ? "auth-input--error" : ""}`}
                  value={form.email}
                  onChange={set("email")}
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

            {/* Phone Number Field (Optional) */}
            <div className="auth-label">
              <span className="auth-label-text">
                <span>Phone number</span>
                <span className="auth-optional">Optional</span>
              </span>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 (555) 000-0000"
                  className={`auth-input ${fieldErrors.phoneNumber ? "auth-input--error" : ""}`}
                  value={form.phoneNumber}
                  onChange={set("phoneNumber")}
                />
              </div>
              {fieldErrors.phoneNumber && (
                <div className="auth-field-error">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{fieldErrors.phoneNumber}</span>
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
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  className={`auth-input auth-input--has-eye ${fieldErrors.password ? "auth-input--error" : ""}`}
                  value={form.password}
                  onChange={set("password")}
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

            {/* Live Password Strength Requirements Box */}
            <div className="auth-rules-box">
              <div className="auth-rules-title">Password Requirements</div>
              <ul className="auth-rules-list">
                <li className={`auth-rule-item ${hasMinLength ? "auth-rule-item--valid" : ""}`}>
                  <span className="auth-rule-dot">{hasMinLength ? "✓" : "•"}</span>
                  <span>At least 8 characters</span>
                </li>
                <li className={`auth-rule-item ${hasUppercase ? "auth-rule-item--valid" : ""}`}>
                  <span className="auth-rule-dot">{hasUppercase ? "✓" : "•"}</span>
                  <span>At least one uppercase letter (A-Z)</span>
                </li>
                <li className={`auth-rule-item ${hasNumber ? "auth-rule-item--valid" : ""}`}>
                  <span className="auth-rule-dot">{hasNumber ? "✓" : "•"}</span>
                  <span>At least one number (0-9)</span>
                </li>
              </ul>
            </div>

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
                  <span>Creating your account…</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>

            {/* Terms of Service note */}
            <p className="auth-terms-note">
              By creating an account, you agree to Artify's{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </p>

            {/* Bottom Switch Link */}
            <footer className="auth-footer">
              Already have an account?{" "}
              <Link to="/login" state={location.state}>
                Log in
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