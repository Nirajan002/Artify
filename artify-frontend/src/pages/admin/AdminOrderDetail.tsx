import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAdvanceOrderMutation, useGetAdminOrderByIdQuery } from "../../features/admin/adminApi";
import { formatPrice, imageUrl } from "../../utils/image";
import { getErrorMessage } from "../../utils/errors";
import { showToast } from "../../components/Toast";
import ConfirmDialog from "../../components/ConfirmDialog";

const STATUS_STEPS = ["Pending", "Confirmed", "Processing", "Printing", "Framing", "Shipped", "Delivered"];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useGetAdminOrderByIdQuery(Number(id));
  const [advance, { isLoading: advancing }] = useAdvanceOrderMutation();
  const [showConfirm, setShowConfirm] = useState(false);
  const order = data?.data;

  const onAdvance = async () => {
    setShowConfirm(false);
    try {
      await advance({ id: Number(id) }).unwrap();
      showToast("Order status advanced.", "success");
    } catch (e) {
      showToast(getErrorMessage(e), "error");
    }
  };

  if (isLoading) {
    return (
      <main>
        <div className="table-loading">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton-row" style={{ height: "60px" }} />)}
        </div>
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main>
        <div className="state-card state-card--error">
          <p>Could not load order.</p>
          <button onClick={refetch}>Try again</button>
        </div>
      </main>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <main>
      <div className="page-header" style={{ marginBottom: "1.75rem" }}>
        <div>
          <Link to="/admin/orders" className="back-link">← Orders</Link>
          <h1 style={{ marginTop: "0.25rem" }}>{order.orderNumber}</h1>
        </div>
        {order.orderStatus !== "Cancelled" && order.orderStatus !== "Delivered" && (
          <button onClick={() => setShowConfirm(true)} disabled={advancing} className="button">
            {advancing ? "Advancing…" : "Advance status →"}
          </button>
        )}
      </div>

      {/* Status progress */}
      <div className="detail-card" style={{ marginBottom: "1.5rem" }}>
        <ul className="status-steps">
          {(order.statusFlow ?? STATUS_STEPS).map((step, i) => (
            <li key={step} className={i <= currentStep ? "done" : ""}>
              {step}
            </li>
          ))}
        </ul>
      </div>

      {/* Summary grid */}
      <div className="detail-card detail-card--grid" style={{ marginBottom: "1.5rem" }}>
        <div className="detail-field">
          <span className="detail-label">Customer</span>
          <span className="detail-value">{order.shippingAddress?.split(",")[0] ?? "—"}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Total</span>
          <span className="detail-value detail-value--price">{formatPrice(order.totalAmount)}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Order Status</span>
          <span className={`badge badge--${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Payment</span>
          <span className="detail-value">{order.paymentStatus}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Date</span>
          <span className="detail-value">{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Method</span>
          <span className="detail-value">{order.paymentMethod}</span>
        </div>
      </div>

      {/* Shipping address */}
      {order.shippingAddress && (
        <div className="detail-card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a8070", marginBottom: "0.5rem" }}>
            Shipping Address
          </h3>
          <p style={{ color: "#d4e8d8", fontSize: "0.9rem", lineHeight: 1.6 }}>{order.shippingAddress}</p>
        </div>
      )}

      {/* Items */}
      <div className="detail-card">
        <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a8070", marginBottom: "1rem" }}>
          Items ({order.itemCount})
        </h3>
        <ul className="order-items-list">
          {order.items?.map((item) => (
            <li key={item.orderItemId} className="order-item-row">
              <img src={imageUrl(item.imageUrl)} alt={item.title} width={56} height={56} />
              <div className="order-item-info">
                <strong>{item.title}</strong>
                <span className="muted">
                  {item.variantType && `${item.variantType} · `}
                  {item.materialName && `${item.materialName} · `}
                  {item.frameName && `${item.frameName} · `}
                  {item.customWidth && `${item.customWidth}" × ${item.customHeight}"`}
                </span>
              </div>
              <div className="order-item-price">
                <span className="muted">×{item.quantity}</span>
                <strong>{formatPrice(item.totalPrice)}</strong>
              </div>
            </li>
          ))}
        </ul>

        <div className="order-totals">
          <div className="order-total-row"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="order-total-row"><span>Shipping</span><span>{order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</span></div>
          {order.discount > 0 && (
            <div className="order-total-row"><span>Discount</span><span>−{formatPrice(order.discount)}</span></div>
          )}
          <div className="order-total-row order-total-row--total">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Advance Order Status"
        message={`Move order ${order.orderNumber} to the next status?`}
        confirmLabel="Advance"
        onConfirm={onAdvance}
        onCancel={() => setShowConfirm(false)}
      />
    </main>
  );
}
