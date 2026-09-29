import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <footer className="footer">
        <p>© {new Date().getFullYear()} <strong style={{ color: "#C8FF00" }}>Artify</strong> — Art You Love. Prints You Create.</p>
      </footer>
    </>
  );
}