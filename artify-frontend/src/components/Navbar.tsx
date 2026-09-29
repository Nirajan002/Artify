import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../app/store";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../features/auth/authApi";
import { useGetCartQuery } from "../features/cart/cartApi";
import { useGetWishlistQuery } from "../features/wishlist/wishlistApi";
import { useGetCategoriesQuery } from "../features/artworks/artworksApi";

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");

  const { data: cart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const { data: wishlist } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const { data: cats } = useGetCategoriesQuery();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/shop?search=${encodeURIComponent(q.trim())}` : "/shop");
    setMobileOpen(false);
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">Artify</Link>

      <nav className="navbar__links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/shop">Shop</NavLink>
        <details className="navbar__dropdown">
          <summary>Categories ▾</summary>
          <ul>
            {cats?.data.map((c) => (
              <li key={c.categoryId}><Link to={`/categories/${c.slug}`}>{c.name}</Link></li>
            ))}
          </ul>
        </details>
        <NavLink to="/custom-print">Custom Print</NavLink>
        <NavLink to="/list-your-artwork">List Artwork</NavLink>
      </nav>

      <form onSubmit={onSearch} className="navbar__search" role="search">
        <input type="search" placeholder="Search art…" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>

      <div className="navbar__actions">
        <Link to="/wishlist">
          ♡{wishlist?.data.length ? ` (${wishlist.data.length})` : ""}
        </Link>
        <Link to="/cart">
          🛒{cart?.data.itemCount ? ` (${cart.data.itemCount})` : ""}
        </Link>

        {isAuthenticated ? (
          <details className="navbar__dropdown navbar__dropdown--right">
            <summary style={{ cursor: "pointer", listStyle: "none" }}>
              <span style={{
                background: "rgba(200,255,0,0.12)",
                color: "#C8FF00",
                border: "1px solid rgba(200,255,0,0.25)",
                borderRadius: "8px",
                padding: "0.35rem 0.75rem",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}>
                {user?.firstName} ▾
              </span>
            </summary>
            <ul>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/orders">My orders</Link></li>
              <li><Link to="/addresses">Addresses</Link></li>
              {isAdmin && <li><Link to="/admin">Admin</Link></li>}
              <li>
                <button
                  onClick={() => { dispatch(logout()); navigate("/"); }}
                  style={{ background: "none", color: "#ff8080", fontWeight: 600, padding: "0.5rem 0.75rem", boxShadow: "none" }}
                >
                  Log out
                </button>
              </li>
            </ul>
          </details>
        ) : (
          <Link
            to="/login"
            style={{
              background: "#C8FF00",
              color: "#06110D",
              fontWeight: 700,
              padding: "0.4rem 1rem",
              borderRadius: "7px",
              fontSize: "0.875rem",
            }}
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}