import { useState, useEffect } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: "◈", end: true },
  { to: "/admin/artworks", label: "Artworks", icon: "🖼" },
  { to: "/admin/submissions", label: "Submissions", icon: "📥" },
  { to: "/admin/orders", label: "Orders", icon: "📦" },
  { to: "/admin/reviews", label: "Reviews", icon: "⭐" },
  { to: "/admin/materials", label: "Materials", icon: "🎨" },
  { to: "/admin/frames", label: "Frames", icon: "🖼" },
  { to: "/admin/users", label: "Users", icon: "👥" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="admin-shell">
      {/* Mobile top bar */}
      <div className="admin-topbar">
        <button
          className="admin-topbar__toggle"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle navigation"
          aria-expanded={sidebarOpen}
        >
          <span className={`hamburger ${sidebarOpen ? "hamburger--open" : ""}`}>
            <span /><span /><span />
          </span>
        </button>
        <Link to="/" className="admin-topbar__brand">Artify</Link>
        <span className="admin-topbar__label">Admin</span>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__head">
          <Link to="/" className="admin-sidebar__brand">
            <span className="admin-sidebar__logo">Artify</span>
          </Link>
          <span className="admin-sidebar__badge">Admin Panel</span>
        </div>
        <nav className="admin-sidebar__nav">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="admin-sidebar__link">
              <span className="admin-sidebar__icon">{l.icon}</span>
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <Link to="/" className="admin-sidebar__link admin-sidebar__link--exit">
            <span className="admin-sidebar__icon">←</span>
            <span>Back to store</span>
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
