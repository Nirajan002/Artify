import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import Shop from "./pages/Shop";
import ArtworkDetails from "./pages/ArtworkDetails";
import ListYourArtwork from "./pages/ListYourArtwork";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Addresses from "./pages/Addresses";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import AdminSubmissionDetail from "./pages/admin/AdminSubmissionDetail";
import CustomPrint from "./pages/CustomPrint";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArtworks from "./pages/admin/AdminArtworks";
import AdminArtworkForm from "./pages/admin/AdminArtworkForm";
import AdminMaterials from "./pages/admin/AdminMaterials";
import AdminFrames from "./pages/admin/AdminFrames";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import Home from "./pages/Home";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* public */}
        <Route path="/" element={<Home />} />
        <Route path="/" element={<div className="page">Home (Phase 10)</div>} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/categories/:category" element={<Shop />} />
        <Route path="/artworks/:id" element={<ArtworkDetails />} />
        <Route path="/list-your-artwork" element={<ListYourArtwork />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/custom-print" element={<CustomPrint />} />

        {/* signed-in customers */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
        </Route>

        {/* admin */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/artworks" element={<AdminArtworks />} />
            <Route path="/admin/artworks/new" element={<AdminArtworkForm />} />
            <Route path="/admin/artworks/:id" element={<AdminArtworkForm />} />
            <Route path="/admin/submissions" element={<AdminSubmissions />} />
            <Route
              path="/admin/submissions/:id"
              element={<AdminSubmissionDetail />}
            />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
            <Route path="/admin/materials" element={<AdminMaterials />} />
            <Route path="/admin/frames" element={<AdminFrames />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
