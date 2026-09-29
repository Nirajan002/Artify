import { NavLink, Outlet, Link } from "react-router-dom";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/artworks", label: "Artworks" },
  { to: "/admin/submissions", label: "Submissions" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/materials", label: "Materials" },
  { to: "/admin/frames", label: "Frames" },
  { to: "/admin/users", label: "Users" },
];

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" style={{ textDecoration: "none" }}>
          <h2 style={{ fontSize: "1.1rem", color: "#C8FF00", marginBottom: "0.25rem", textTransform: "none", letterSpacing: "normal" }}>
            Artify
          </h2>
        </Link>
        <p style={{ fontSize: "0.7rem", color: "#3a6048", marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Admin Panel
        </p>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>
          ))}
        </nav>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}