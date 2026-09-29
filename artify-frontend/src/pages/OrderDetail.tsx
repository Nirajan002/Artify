import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useCancelOrderMutation, useGetOrderQuery } from "../features/orders/ordersApi";
import { formatPrice, imageUrl } from "../utils/image";
import { getErrorMessage } from "../utils/errors";

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced = (location.state as { justPlaced?: boolean })?.justPlaced;
  const { data, isLoading, isError, refetch } = useGetOrderQuery(Number(id), { skip: !id });
  const [cancel, { isLoading: cancelling }] = useCancelOrderMutation();
  const [error, setError] = useState("");

  if (isLoading) return <div className="page" style={{ textAlign: "center" }}><p className="muted">Loading order…</p></div>;
  if (isError || !data) return (
    <div className="page" style={{ textAlign: "center" }}>
      <p className="muted">Order not found. <button onClick={refetch}>Try again</button></p>
    </div>
  );
  const o = data.data;
  const currentStep = o.orderStatus === "Cancelled" ? -1 : o.statusFlow.indexOf(o.orderStatus);

  const onCancel = async () => {
    if (!window.confirm("Cancel this order?")) return;
    setError("");
    try { await cancel(o.orderId).unwrap(); } catch (e) { setError(getErrorMessage(e)); }
  };

  return (
    <main className="page order-detail">
      {justPlaced && (
        <div style={{
          background: "rgba(200,255,0,0.08)",
          border: "1px solid rgba(200,255,0,0.25)",
          borderRadius: "10px",
          padding: "1rem 1.25rem",
          marginBottom: "2rem",
          color: "#C8FF00",
          fontWeight: 600,
        }}>
          🎉 Thank you! Your order has been placed.
        </div>
      )}

      <div style={{ marginBottom: "2rem" }}>
        <p className="muted" style={{ marginBottom: "0.25rem" }}>
          Placed on {new Date(o.createdAt).toLocaleString()}
        </p>
        <h1 style={{ fontSize: "1.75rem" }}>Order {o.orderNumber}</h1>
      </div>

      {o.orderStatus === "Cancelled" ? (
        <span className="badge badge--cancelled" style={{ fontSize: "0.85rem", padding: "0.35rem 0.85rem", marginBottom: "1.5rem", display: "inline-flex" }}>
          Cancelled
        </span>
      ) : (
        <ol className="status-steps" style={{ marginBottom: "2rem" }}>
          {o.statusFlow.map((s, i) => (
            <li key={s} className={i <= currentStep ? "done" : ""}>{s}</li>
          ))}
        </ol>
      )}

      <section>
        <h2>Items</h2>
        <ul className="checkout-review">
          {o.items.map((i) => (
            <li key={i.orderItemId}>
              <img src={imageUrl(i.imageUrl)} alt="" width={56} height={56} style={{ objectFit: "cover", borderRadius: "6px" }} />
              <div style={{ flex: 1 }}>
                <span style={{ color: "#d4e8d8" }}>{i.title}</span>
                <p className="muted">
                  {i.variantType ? i.variantType : `${i.customWidth} × ${i.customHeight} in · ${i.materialName} · ${i.frameName}`}
                  {" · "}Qty {i.quantity}
                </p>
              </div>
              <strong style={{ color: "#C8FF00" }}>{formatPrice(i.totalPrice)}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Order summary</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem", color: "#8ab89e" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Subtotal</span><span>{formatPrice(o.subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Shipping</span><span>{formatPrice(o.shippingFee)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 700, color: "#C8FF00", borderTop: "1px solid rgba(200,255,0,0.1)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
            <span>Total</span><span>{formatPrice(o.totalAmount)}</span>
          </div>
          <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
            Payment: {o.paymentMethod === "CashOnDelivery" ? "Cash on delivery" : "Paid online"} — {o.paymentStatus}
          </p>
        </div>
      </section>

      <section>
        <h2>Shipping to</h2>
        <p style={{ color: "#8ab89e", fontSize: "0.9rem" }}>{o.shippingAddress}</p>
      </section>

      {error && <p className="error" role="alert">{error}</p>}

      <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        {o.canCancel && (
          <button className="danger" onClick={onCancel} disabled={cancelling}>
            {cancelling ? "Cancelling…" : "Cancel order"}
          </button>
        )}
        <Link to="/orders" style={{ color: "#5a8070", fontSize: "0.875rem" }}>← Back to orders</Link>
      </div>
    </main>
  );
}