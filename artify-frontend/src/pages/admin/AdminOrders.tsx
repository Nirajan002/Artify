import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdvanceOrderMutation, useGetAdminOrdersQuery } from "../../features/admin/adminApi";
import Pagination from "../../components/Pagination";
import { formatPrice } from "../../utils/image";
import { getErrorMessage } from "../../utils/errors";
import { showToast } from "../../components/Toast";
import ConfirmDialog from "../../components/ConfirmDialog";

const STATUSES = ["", "Pending", "Confirmed", "Processing", "Printing", "Framing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [advanceTarget, setAdvanceTarget] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useGetAdminOrdersQuery({
    status: status || undefined,
    search: search || undefined,
    page,
  });
  const [advance, { isLoading: advancing }] = useAdvanceOrderMutation();
  const result = data?.data;

  const handleSearch = () => {
    setSearch(inputVal.trim());
    setPage(1);
  };

  const onAdvance = async () => {
    if (!advanceTarget) return;
    try {
      await advance({ id: advanceTarget }).unwrap();
      showToast("Order status advanced.", "success");
    } catch (e) {
      showToast(getErrorMessage(e), "error");
    } finally {
      setAdvanceTarget(null);
    }
  };

  return (
    <main>
      <div className="page-header">
        <h1>Orders</h1>
        {result && <span className="page-header__count">{result.totalCount} orders</span>}
      </div>

      {/* Toolbar */}
      <div className="table-toolbar">
        <div className="search-row" style={{ flex: 1 }}>
          <div className="search-input-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search by order # or customer…"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="search-input"
            />
          </div>
          <button onClick={handleSearch} className="search-btn">Search</button>
        </div>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          style={{ width: "auto", flexShrink: 0 }}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
        </select>
      </div>

      {isLoading && (
        <div className="table-loading">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton-row" />)}
        </div>
      )}

      {isError && (
        <div className="state-card state-card--error">
          <p>Failed to load orders.</p>
          <button onClick={refetch}>Try again</button>
        </div>
      )}

      {!isLoading && !isError && result && (
        <>
          {result.items.length === 0 ? (
            <div className="state-card">
              <p className="muted">No orders found{search ? ` for "${search}"` : ""}.</p>
            </div>
          ) : (
            <div className="table-wrapper">
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
                  {result.items.map((o) => (
                    <tr key={o.orderId}>
                      <td>
                        <Link to={`/admin/orders/${o.orderId}`} style={{ fontWeight: 600 }}>
                          {o.orderNumber}
                        </Link>
                        <br />
                        <small className="muted">{new Date(o.createdAt).toLocaleDateString()}</small>
                      </td>
                      <td>
                        <span className="user-name">{o.customerName}</span>
                        <br />
                        <small className="muted">{o.customerEmail}</small>
                      </td>
                      <td style={{ color: "#C8FF00", fontWeight: 700 }}>{formatPrice(o.totalAmount)}</td>
                      <td className="muted">{o.hasCustomPrint ? "Custom print" : "Artwork"}</td>
                      <td>
                        <span className={`badge badge--${o.orderStatus.toLowerCase()}`}>{o.orderStatus}</span>
                      </td>
                      <td className="muted">{o.paymentStatus}</td>
                      <td>
                        <div className="action-btns">
                          <Link to={`/admin/orders/${o.orderId}`} className="btn-action">View</Link>
                          {o.orderStatus !== "Cancelled" && o.orderStatus !== "Delivered" && (
                            <button
                              onClick={() => setAdvanceTarget(o.orderId)}
                              disabled={advancing}
                              className="btn-action btn-action--primary"
                            >
                              Advance
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={result.page} totalPages={result.totalPages} onChange={(p) => { setPage(p); }} />
        </>
      )}

      <ConfirmDialog
        open={!!advanceTarget}
        title="Advance Order"
        message="Move this order to the next status stage?"
        confirmLabel="Advance"
        onConfirm={onAdvance}
        onCancel={() => setAdvanceTarget(null)}
      />
    </main>
  );
}
