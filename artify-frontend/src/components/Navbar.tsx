import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { data: cart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const { data: wishlist } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const { data: cats } = useGetCategoriesQuery();

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll and add overlay when mobile nav is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add("body--nav-open");
    } else {
      document.body.classList.remove("body--nav-open");
    }
    return () => document.body.classList.remove("body--nav-open");
  }, [mobileOpen]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/shop?search=${encodeURIComponent(q.trim())}` : "/shop");
    setMobileOpen(false);
  };

  const cartCount = cart?.data.itemCount ?? 0;
  const wishlistCount = wishlist?.data.length ?? 0;

  return (
    <>
      <header className="navbar">
        {/* Brand */}
        <Link to="/" className="navbar__brand">Artify</Link>

        {/* Desktop nav */}
        <nav className="navbar__links" aria-label="Main navigation">
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

        {/* Search */}
        <form onSubmit={onSearch} className="navbar__search" role="search">
          <input
            type="search"
            placeholder="Search art…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search artwork"
          />
        </form>

        {/* Actions */}
        <div className="navbar__actions">
          <Link to="/wishlist" className="navbar__icon-btn" aria-label={`Wishlist${wishlistCount ? ` (${wishlistCount})` : ""}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={20} height={20}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlistCount > 0 && <span className="navbar__badge">{wishlistCount}</span>}
          </Link>

          <Link to="/cart" className="navbar__icon-btn" aria-label={`Cart${cartCount ? ` (${cartCount})` : ""}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={20} height={20}>
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && <span className="navbar__badge">{cartCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="navbar__user" ref={userMenuRef}>
              <button
                className="navbar__user-btn"
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <span className="navbar__user-avatar">{user?.firstName?.[0]?.toUpperCase()}</span>
                <span className="navbar__user-name">{user?.firstName}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}
                  style={{ transform: userMenuOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {userMenuOpen && (
                <div className="navbar__user-menu" role="menu">
                  <Link to="/orders" role="menuitem">My Orders</Link>
                  <Link to="/addresses" role="menuitem">Addresses</Link>
                  <Link to="/wishlist" role="menuitem">Wishlist</Link>
                  {isAdmin && <Link to="/admin" role="menuitem" className="navbar__admin-link">Admin Panel</Link>}
                  <hr className="navbar__menu-divider" />
                  <button
                    role="menuitem"
                    onClick={() => { dispatch(logout()); navigate("/"); setUserMenuOpen(false); }}
                    className="navbar__logout"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar__login-btn">Login</Link>
          )}
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="navbar__hamburger"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
        >
          <span className={`hamburger ${mobileOpen ? "hamburger--open" : ""}`}>
            <span /><span /><span />
          </span>
        </button>
      </header>

      {/* Mobile overlay — closes menu on tap */}
      {mobileOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="mobile-nav" role="navigation" aria-label="Mobile navigation">
          <form onSubmit={onSearch} className="mobile-nav__search" role="search">
            <input
              type="search"
              placeholder="Search art…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          </form>

          <nav className="mobile-nav__links">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/custom-print">Custom Print</NavLink>
            <NavLink to="/list-your-artwork">List Artwork</NavLink>
            {cats?.data.map((c) => (
              <Link key={c.categoryId} to={`/categories/${c.slug}`} className="mobile-nav__category">
                {c.name}
              </Link>
            ))}
          </nav>

          <div className="mobile-nav__user">
            {isAuthenticated ? (
              <>
                <Link to="/orders">My Orders</Link>
                <Link to="/addresses">Addresses</Link>
                <Link to="/wishlist">
                  Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
                </Link>
                <Link to="/cart">
                  Cart{cartCount > 0 ? ` (${cartCount})` : ""}
                </Link>
                {isAdmin && <Link to="/admin">Admin Panel</Link>}
                <button
                  onClick={() => { dispatch(logout()); navigate("/"); }}
                  className="mobile-nav__logout"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="button">Login</Link>
                <Link to="/register" className="button button--outline">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
