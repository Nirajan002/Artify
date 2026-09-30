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
  const [removeItem, { isLoading: removing }] = useRemoveCartItemMutation();
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

  if (isLoading) {
    return (
      <div className="cart-page">
        <div className="cart-page__header">
          <h1>Your Cart</h1>
        </div>
        <div className="cart-skeleton">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="cart-skeleton__item skeleton-block" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="cart-page">
        <div className="cart-page__header"><h1>Your Cart</h1></div>
        <div className="state-card state-card--error">
          <p>Could not load your cart.</p>
          <button onClick={refetch}>Try again</button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-page__header"><h1>Your Cart</h1></div>
        <div className="cart-empty">
          <div className="cart-empty__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} width={48} height={48}>
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h2>Your cart is empty</h2>
          <p className="muted">Looks like you haven't added anything yet.</p>
          <div className="cart-empty__actions">
            <Link to="/shop" className="button">Browse artwork</Link>
            <Link to="/custom-print" className="button button--outline">Print your own art</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page" style={{ opacity: isFetching ? 0.75 : 1, transition: "opacity 0.2s" }}>
      {/* Header */}
      <div className="cart-page__header">
        <h1>Your Cart</h1>
        <span className="cart-page__count">{cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}</span>
      </div>

      {/* Issues banner */}
      {cart.hasIssues && (
        <div className="cart-notice cart-notice--warn" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Some items can't be purchased right now. Remove them to continue.
        </div>
      )}

      {error && (
        <div className="cart-notice cart-notice--error" role="alert">{error}</div>
      )}

      {/* Body: items + summary */}
      <div className="cart-layout">
        {/* Item list */}
        <section className="cart-items" aria-label="Cart items">
          <ul className="cart-items__list">
            {cart.items.map((item) => (
              <li
                key={item.cartItemId}
                className={`cart-item${item.issue ? " cart-item--issue" : ""}`}
              >
                {/* Image */}
                <Link
                  to={item.artworkId ? `/artworks/${item.artworkId}` : "#"}
                  className="cart-item__img-wrap"
                  tabIndex={item.artworkId ? 0 : -1}
                >
                  <img
                    src={imageUrl(item.imageUrl)}
                    alt={item.title}
                    width={96}
                    height={118}
                  />
                </Link>

                {/* Info */}
                <div className="cart-item__body">
                  <div className="cart-item__top">
                    <div className="cart-item__meta">
                      <h3 className="cart-item__title">
                        {item.artworkId ? (
                          <Link to={`/artworks/${item.artworkId}`}>{item.title}</Link>
                        ) : item.title}
                      </h3>
                      <p className="cart-item__variant">
                        {item.variantType
                          ? LABELS[item.variantType] ?? item.variantType
                          : (() => {
                              const ci = item as typeof item & {
                                customWidth?: number;
                                customHeight?: number;
                                materialName?: string;
                                frameName?: string;
                              };
                              return `${ci.customWidth ?? 0} × ${ci.customHeight ?? 0} in · ${ci.materialName ?? "Custom"} · ${ci.frameName ?? "No frame"}`;
                            })()}
                      </p>
                      {item.issue && (
                        <p className="cart-item__issue">{item.issue}</p>
                      )}
                    </div>

                    {/* Price — top-right on desktop */}
                    <div className="cart-item__price-block">
                      <strong className="cart-item__price">{formatPrice(item.lineTotal)}</strong>
                      {item.quantity > 1 && (
                        <small className="cart-item__unit-price">{formatPrice(item.unitPrice)} each</small>
                      )}
                    </div>
                  </div>

                  {/* Controls row */}
                  <div className="cart-item__controls">
                    {item.variantType === "Original" ? (
                      <span className="cart-item__qty-label">Qty: 1 (unique)</span>
                    ) : (
                      <div className="cart-item__qty">
                        <button
                          className="cart-item__qty-btn"
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= 1}
                          onClick={() => changeQty(item.cartItemId, item.quantity - 1)}
                        >−</button>
                        <span className="cart-item__qty-val">{item.quantity}</span>
                        <button
                          className="cart-item__qty-btn"
                          aria-label="Increase quantity"
                          disabled={item.quantity >= 10}
                          onClick={() => changeQty(item.cartItemId, item.quantity + 1)}
                        >+</button>
                      </div>
                    )}

                    <button
                      className="cart-item__remove"
                      onClick={() => removeItem(item.cartItemId)}
                      disabled={removing}
                      aria-label={`Remove ${item.title}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Summary sidebar */}
        <aside className="cart-summary" aria-label="Order summary">
          <h2 className="cart-summary__title">Order Summary</h2>

          <div className="cart-summary__rows">
            <div className="cart-summary__row">
              <span>Subtotal ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="cart-summary__row cart-summary__row--shipping">
              <span>Shipping</span>
              <span className="cart-summary__shipping-note">Calculated at checkout</span>
            </div>
          </div>

          <div className="cart-summary__total">
            <span>Estimated Total</span>
            <strong>{formatPrice(cart.subtotal)}</strong>
          </div>

          <Link
            to="/checkout"
            className={`button cart-summary__checkout${cart.hasIssues ? " disabled" : ""}`}
            aria-disabled={cart.hasIssues}
            onClick={(e) => cart.hasIssues && e.preventDefault()}
          >
            Proceed to Checkout →
          </Link>

          <Link to="/shop" className="cart-summary__continue">
            ← Continue Shopping
          </Link>

          <button
            className="cart-summary__clear"
            onClick={() => clearCart()}
            disabled={clearing}
          >
            {clearing ? "Clearing…" : "Clear cart"}
          </button>
        </aside>
      </div>
    </div>
  );
}
