import { Outlet, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <footer className="footer">
        <div className="footer__inner">
          {/* Brand col */}
          <div className="footer__brand-col">
            <Link to="/" className="footer__brand-name">Artify</Link>
            <p className="footer__tagline">
              Discover original artwork from talented artists around the world, or turn your own creation into a beautiful physical print.
            </p>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="footer__social-link" aria-label="Twitter / X">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="footer__social-link" aria-label="Pinterest">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Grid: Shop, Artists, Info */}
          <div className="footer__nav-grid">
            <div className="footer__col">
              <p className="footer__col-title">Shop</p>
              <ul className="footer__links">
                <li><Link to="/shop">All Art</Link></li>
                <li><Link to="/shop?sort=newest">New Arrivals</Link></li>
                <li><Link to="/shop?sort=popular">Popular</Link></li>
                <li><Link to="/shop?sort=rating">Top Rated</Link></li>
                <li><Link to="/custom-print">Custom Print</Link></li>
              </ul>
            </div>

            <div className="footer__col">
              <p className="footer__col-title">Artists</p>
              <ul className="footer__links">
                <li><Link to="/list-your-artwork">List Artwork</Link></li>
                <li><Link to="/orders">My Orders</Link></li>
                <li><Link to="/wishlist">Wishlist</Link></li>
                <li><Link to="/addresses">Addresses</Link></li>
              </ul>
            </div>

            <div className="footer__col">
              <p className="footer__col-title">Info</p>
              <ul className="footer__links">
                <li><a href="#">About Us</a></li>
                <li><a href="#">How It Works</a></li>
                <li><a href="#">Shipping</a></li>
                <li><a href="#">Returns</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            © {new Date().getFullYear()} <strong>Artify</strong> — Art You Love. Prints You Create.
          </p>
          <nav className="footer__legal" aria-label="Legal links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
