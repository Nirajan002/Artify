import { useGetDashboardChartsQuery, useGetDashboardStatsQuery } from "../../features/admin/adminApi";
import { formatPrice, imageUrl } from "../../utils/image";

function Bars({ data, label }: { data: { label: string; value: number }[]; label: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="bar-chart" aria-label={label}>
      {data.map((d) => (
        <div key={d.label} className="bar-chart__col">
          <div
            className="bar-chart__bar"
            style={{ height: `${(d.value / max) * 100}%` }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: statsRes, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: chartsRes, isLoading: chartsLoading } = useGetDashboardChartsQuery();
  const stats = statsRes?.data;
  const charts = chartsRes?.data;

  return (
    <main>
      <h1>Dashboard</h1>

      {statsLoading ? (
        <p className="muted">Loading stats…</p>
      ) : stats && (
        <div className="stat-grid">
          <div className="stat-card"><span>{stats.totalUsers}</span><label>Total Users</label></div>
          <div className="stat-card"><span>{stats.totalArtworks}</span><label>Total Artworks</label></div>
          <div className="stat-card"><span>{stats.totalOrders}</span><label>Total Orders</label></div>
          <div className="stat-card"><span>{formatPrice(stats.totalRevenue)}</span><label>Total Revenue</label></div>
          <div className="stat-card highlight"><span>{stats.pendingSubmissions}</span><label>Pending Submissions</label></div>
          <div className="stat-card highlight"><span>{stats.pendingOrders}</span><label>Pending Orders</label></div>
          <div className="stat-card"><span>{stats.customPrintOrders}</span><label>Custom Print Orders</label></div>
        </div>
      )}

      {chartsLoading ? (
        <p className="muted">Loading charts…</p>
      ) : charts && (
        <div className="chart-grid">
          <section className="chart-card">
            <h3>Monthly revenue</h3>
            <Bars label="Monthly revenue" data={charts.monthly.map((m) => ({ label: m.month, value: m.revenue }))} />
          </section>

          <section className="chart-card">
            <h3>Monthly orders</h3>
            <Bars label="Monthly orders" data={charts.monthly.map((m) => ({ label: m.month, value: m.orders }))} />
          </section>

          <section className="chart-card">
            <h3>Popular artworks</h3>
            <ul className="rank-list">
              {charts.popularArtworks.map((a) => (
                <li key={a.artworkId}>
                  <img src={imageUrl(a.imageUrl)} alt="" width={40} height={40} style={{ objectFit: "cover" }} />
                  <span>{a.title}</span>
                  <span className="muted">{a.unitsSold} sold</span>
                  <strong>{formatPrice(a.revenue)}</strong>
                </li>
              ))}
              {charts.popularArtworks.length === 0 && <p className="muted">No sales yet.</p>}
            </ul>
          </section>

          <section className="chart-card">
            <h3>Sales by category</h3>
            <ul className="rank-list">
              {charts.salesByCategory.map((c) => (
                <li key={c.category}>
                  <span>{c.category}</span>
                  <span className="muted">{c.unitsSold} units</span>
                  <strong>{formatPrice(c.revenue)}</strong>
                </li>
              ))}
              {charts.salesByCategory.length === 0 && <p className="muted">No sales yet.</p>}
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}