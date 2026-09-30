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
              <a href="#" className="footer__social-link" aria-label="Instagram">IG</a>
              <a href="#" className="footer__social-link" aria-label="Twitter / X">𝕏</a>
              <a href="#" className="footer__social-link" aria-label="Pinterest">PT</a>
            </div>
          </div>

          {/* Shop col */}
          <div>
            <p className="footer__col-title">Shop</p>
            <ul className="footer__links">
              <li><Link to="/shop">All Art</Link></li>
              <li><Link to="/shop?sort=newest">New Arrivals</Link></li>
              <li><Link to="/shop?sort=popular">Popular</Link></li>
              <li><Link to="/shop?sort=rating">Top Rated</Link></li>
              <li><Link to="/custom-print">Custom Print</Link></li>
            </ul>
          </div>

          {/* Sell col */}
          <div>
            <p className="footer__col-title">Artists</p>
            <ul className="footer__links">
              <li><Link to="/list-your-artwork">List Your Artwork</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/addresses">Addresses</Link></li>
            </ul>
          </div>

          {/* Info col */}
          <div>
            <p className="footer__col-title">Info</p>
            <ul className="footer__links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">How It Works</a></li>
              <li><a href="#">Shipping Info</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
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
