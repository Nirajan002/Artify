import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAddToCartMutation } from "../features/cart/cartApi";
import { getErrorMessage } from "../utils/errors";

export default function AddToCartButton({ variantId }: { variantId?: number }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [addToCart, { isLoading }] = useAddToCartMutation();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const onClick = async () => {
    if (!variantId) return;
    if (!isAuthenticated) { navigate("/login", { state: { from: location } }); return; }
    try {
      await addToCart({ itemType: "Artwork", artworkVariantId: variantId, quantity: 1 }).unwrap();
      setMsg({ ok: true, text: "Added to your cart." });
    } catch (e) {
      setMsg({ ok: false, text: getErrorMessage(e) });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <button
        onClick={onClick}
        disabled={!variantId || isLoading}
        style={{ padding: "0.8rem 1.5rem", fontSize: "1rem", fontWeight: 800 }}
      >
        {isLoading ? "Adding…" : "Add to cart"}
      </button>
      {msg && (
        <p role="status" className={msg.ok ? "success" : "error"} style={{ fontSize: "0.875rem" }}>
          {msg.text}{" "}
          {msg.ok && <Link to="/cart" style={{ color: "#C8FF00", textDecoration: "underline" }}>View cart →</Link>}
        </p>
      )}
    </div>
  );
}