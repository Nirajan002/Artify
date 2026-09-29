import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdvanceOrderMutation, useGetAdminOrdersQuery } from "../../features/admin/adminApi";
import Pagination from "../../components/Pagination";
import { formatPrice } from "../../utils/image";
import { getErrorMessage } from "../../utils/errors";

const STATUSES = ["", "Pending", "Confirmed", "Processing", "Printing", "Framing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const { data, isLoading } = useGetAdminOrdersQuery({ status: status || undefined, page });
  const [advance, { isLoading: advancing }] = useAdvanceOrderMutation();
  const [error, setError] = useState("");
  const result = data?.data;

  const onAdvance = async (id: number) => {
    setError("");
    try { await advance({ id }).unwrap(); } catch (e) { setError(getErrorMessage(e)); }
  };

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ margin: 0 }}>Orders</h1>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          style={{ width: "auto" }}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
        </select>
      </div>

      {error && <p className="error" role="alert" style={{ marginBottom: "1rem" }}>{error}</p>}

      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Type</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {result?.items.map((o) => (
              <tr key={o.orderId}>
                <td><Link to={`/admin/orders/${o.orderId}`}>{o.orderNumber}</Link></td>
                <td>
                  <span style={{ color: "#d4e8d8" }}>{o.customerName}</span><br />
                  <small className="muted">{o.customerEmail}</small>
                </td>
                <td style={{ color: "#C8FF00" }}>{formatPrice(o.totalAmount)}</td>
                <td>{o.hasCustomPrint ? "Custom print" : "Artwork"}</td>
                <td><span className={`badge badge--${o.orderStatus.toLowerCase()}`}>{o.orderStatus}</span></td>
                <td>{o.paymentStatus}</td>
                <td>
                  {o.orderStatus !== "Cancelled" && o.orderStatus !== "Delivered" && (
                    <button onClick={() => onAdvance(o.orderId)} disabled={advancing}
                      style={{ padding: "0.3rem 0.65rem", fontSize: "0.8rem" }}>
                      Advance
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {result && <Pagination page={result.page} totalPages={result.totalPages} onChange={setPage} />}
    </main>
  );
}