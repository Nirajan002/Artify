import { Link, useSearchParams } from "react-router-dom";
import { useGetOrdersQuery } from "../features/orders/ordersApi";
import Pagination from "../components/Pagination";
import { formatPrice, imageUrl } from "../utils/image";

export default function Orders() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") ?? 1);
  const { data, isLoading, isError, refetch } = useGetOrdersQuery({ page, pageSize: 10 });
  const result = data?.data;

  if (isLoading) return (
    <div className="page" style={{ textAlign: "center" }}>
      <p className="muted">Loading your orders…</p>
    </div>
  );
  if (isError) return (
    <div className="page" style={{ textAlign: "center" }}>
      <p className="muted">Could not load orders. <button onClick={refetch}>Try again</button></p>
    </div>
  );

  return (
    <main className="page">
      <h1>My orders</h1>
      {result && result.items.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <p className="muted" style={{ marginBottom: "1.5rem" }}>You haven't placed any orders yet.</p>
          <Link to="/shop" className="button">Start shopping</Link>
        </div>
      )}

      <ul className="order-list">
        {result?.items.map((o) => (
          <li key={o.orderId} className="order-row">
            <img src={imageUrl(o.thumbnailUrl)} alt="" width={64} height={64} style={{ objectFit: "cover", borderRadius: "8px" }} />
            <div>
              <Link to={`/orders/${o.orderId}`}>
                <strong style={{ color: "#d4e8d8" }}>{o.orderNumber}</strong>
              </Link>
              <p className="muted">{o.itemCount} item(s) · {new Date(o.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`badge badge--${o.orderStatus.toLowerCase()}`}>{o.orderStatus}</span>
            <strong style={{ color: "#C8FF00", marginLeft: "auto" }}>{formatPrice(o.totalAmount)}</strong>
          </li>
        ))}
      </ul>

      {result && <Pagination page={result.page} totalPages={result.totalPages} onChange={(p) => setParams({ page: String(p) })} />}
    </main>
  );
}