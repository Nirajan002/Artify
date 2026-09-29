import { useParams } from "react-router-dom";
import { useAdvanceOrderMutation, useGetAdminOrdersQuery } from "../../features/admin/adminApi";
import { formatPrice } from "../../utils/image";
import { getErrorMessage } from "../../utils/errors";
import { useState } from "react";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { data, isLoading } = useGetAdminOrdersQuery({});
  const [advance, { isLoading: advancing }] = useAdvanceOrderMutation();
  const [error, setError] = useState("");

  const order = data?.data.items.find((o) => o.orderId === Number(id));

  if (isLoading) return <div style={{ padding: "2rem" }}><p className="muted">Loading…</p></div>;
  if (!order) return (
    <div style={{ padding: "2rem" }}>
      <p className="muted">Order not found in the current page. Use the Orders list to find it.</p>
    </div>
  );

  const onAdvance = async () => {
    setError("");
    try { await advance({ id: order.orderId }).unwrap(); } catch (e) { setError(getErrorMessage(e)); }
  };

  const cardStyle: React.CSSProperties = {
    background: "#0d1f17",
    border: "1px solid rgba(200,255,0,0.08)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.25rem",
  };

  return (
    <main>
      <h1 style={{ marginBottom: "0.5rem" }}>Order {order.orderNumber}</h1>

      <div style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
          <div>
            <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#3a6048", marginBottom: "0.25rem" }}>Customer</p>
            <p style={{ color: "#d4e8d8", fontWeight: 600 }}>{order.customerName}</p>
            <p className="muted" style={{ fontSize: "0.85rem" }}>{order.customerEmail}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#3a6048", marginBottom: "0.25rem" }}>Total</p>
            <p style={{ color: "#C8FF00", fontWeight: 800, fontSize: "1.25rem" }}>{formatPrice(order.totalAmount)}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#3a6048", marginBottom: "0.25rem" }}>Status</p>
            <span className={`badge badge--${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#3a6048", marginBottom: "0.25rem" }}>Payment</p>
            <p style={{ color: "#8ab89e", fontSize: "0.9rem" }}>{order.paymentStatus}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#3a6048", marginBottom: "0.25rem" }}>Type</p>
            <p style={{ color: "#8ab89e", fontSize: "0.9rem" }}>{order.hasCustomPrint ? "Custom print" : "Artwork"}</p>
          </div>
        </div>
      </div>

      {error && <p className="error" role="alert" style={{ marginBottom: "1rem" }}>{error}</p>}

      {order.orderStatus !== "Cancelled" && order.orderStatus !== "Delivered" && (
        <button onClick={onAdvance} disabled={advancing} style={{ padding: "0.75rem 2rem" }}>
          {advancing ? "Advancing…" : "Advance to next status →"}
        </button>
      )}
    </main>
  );
}