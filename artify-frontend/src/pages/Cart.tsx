import { Link } from "react-router-dom";
import {
  useClearCartMutation,
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "../features/cart/cartApi";
import { formatPrice, imageUrl } from "../utils/image";
import { getErrorMessage } from "../utils/errors";
import { useState } from "react";

const LABELS: Record<string, string> = {
  Original: "Original painting",
  Poster: "Poster print",
  Canvas: "Canvas print",
  FramedPrint: "Framed print",
};

export default function Cart() {
  const { data, isLoading, isFetching, isError, refetch } = useGetCartQuery();
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();
  const [clearCart, { isLoading: clearing }] = useClearCartMutation();
  const [error, setError] = useState("");

  const cart = data?.data;

  const changeQty = async (id: number, quantity: number) => {
    setError("");
    try {
      await updateItem({ id, quantity }).unwrap();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  if (isLoading) return (
    <div className="page" style={{ textAlign: "center" }}>
      <p className="muted">Loading your cart…</p>
    </div>
  );
  if (isError) return (
    <div className="page" style={{ textAlign: "center" }}>
      <p className="muted">Could not load your cart. <button onClick={refetch}>Try again</button></p>
    </div>
  );

  if (!cart || cart.items.length === 0) {
    return (
      <main className="page" style={{ textAlign: "center" }}>
        <h1>Your cart</h1>
        <p className="muted" style={{ margin: "1rem 0 2rem" }}>Your cart is empty.</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link to="/shop" className="button">Browse artwork</Link>
          <Link to="/custom-print" className="button button--outline">Print your own art</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page cart" style={{ opacity: isFetching ? 0.7 : 1, maxWidth: "1100px" }}>
      <h1>Your cart</h1>
      {error && <p className="error" role="alert" style={{ marginBottom: "1rem" }}>{error}</p>}
      {cart.hasIssues && (
        <p className="error" role="alert" style={{ marginBottom: "1rem" }}>
          Some items can't be purchased right now. Remove them to continue.
        </p>
      )}

      <ul className="cart__list">
        {cart.items.map((i) => (
          <li key={i.cartItemId} className={`cart__item ${i.issue ? "cart__item--issue" : ""}`}>
            <img src={imageUrl(i.imageUrl)} alt="" width={90} height={110} style={{ objectFit: "cover", borderRadius: "8px" }} />
            <div className="cart__info">
              <h3>
                {i.artworkId ? (
                  <Link to={`/artworks/${i.artworkId}`} style={{ color: "#d4e8d8" }}>{i.title}</Link>
                ) : i.title}
              </h3>
              <p className="muted">
                {i.variantType
                  ? LABELS[i.variantType]
                  : (() => {
                      const customItem = i as typeof i & { customWidth?: number; customHeight?: number; materialName?: string; frameName?: string };
                      return `${customItem.customWidth ?? 0} × ${customItem.customHeight ?? 0} in · ${customItem.materialName ?? "Custom material"} · ${customItem.frameName ?? "No frame"}`;
                    })()}
              </p>
              {i.issue && <p className="error">{i.issue}</p>}
            </div>

            <div className="cart__qty">
              {i.variantType === "Original" ? (
                <span style={{ fontSize: "0.875rem", color: "#5a8070" }}>Qty 1</span>
              ) : (
                <>
                  <button aria-label="Decrease quantity" disabled={i.quantity <= 1}
                    onClick={() => changeQty(i.cartItemId, i.quantity - 1)}>−</button>
                  <span>{i.quantity}</span>
                  <button aria-label="Increase quantity" disabled={i.quantity >= 10}
                    onClick={() => changeQty(i.cartItemId, i.quantity + 1)}>+</button>
                </>
              )}
            </div>

            <div className="cart__price">
              <strong>{formatPrice(i.lineTotal)}</strong>
              {i.quantity > 1 && <small className="muted">{formatPrice(i.unitPrice)} each</small>}
            </div>

            <button
              onClick={() => removeItem(i.cartItemId)}
              aria-label={`Remove ${i.title}`}
              style={{ background: "none", color: "#ff8080", border: "1px solid rgba(255,128,128,0.3)", padding: "0.35rem 0.65rem", fontSize: "0.8rem" }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <aside className="cart__summary">
        <p style={{ color: "#8ab89e", fontSize: "0.875rem" }}>
          Subtotal ({cart.itemCount} items)
        </p>
        <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#C8FF00" }}>
          {formatPrice(cart.subtotal)}
        </p>
        <p className="muted">Shipping is calculated at checkout.</p>
        <Link
          to="/checkout"
          className={`button ${cart.hasIssues ? "disabled" : ""}`}
          style={{ width: "100%", justifyContent: "center" }}
          aria-disabled={cart.hasIssues}
          onClick={(e) => cart.hasIssues && e.preventDefault()}
        >
          Proceed to checkout →
        </Link>
        <button
          onClick={() => clearCart()}
          disabled={clearing}
          style={{ width: "100%", background: "none", color: "#5a8070", border: "1px solid rgba(200,255,0,0.1)", fontWeight: 500 }}
        >
          Clear cart
        </button>
      </aside>
    </main>
  );
}
