import { useGetDashboardChartsQuery, useGetDashboardStatsQuery } from "../../features/admin/adminApi";
import { formatPrice, imageUrl } from "../../utils/image";

const STAT_ICONS: Record<string, string> = {
  totalUsers: "👥",
  totalArtworks: "🖼",
  totalOrders: "📦",
  totalRevenue: "💰",
  pendingSubmissions: "📥",
  pendingOrders: "⏳",
  customPrintOrders: "🖨",
};

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
  const { data: statsRes, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useGetDashboardStatsQuery();
  const { data: chartsRes, isLoading: chartsLoading, isError: chartsError, refetch: refetchCharts } = useGetDashboardChartsQuery();
  const stats = statsRes?.data;
  const charts = chartsRes?.data;

  return (
    <main>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {/* Stats section */}
      {statsLoading ? (
        <div className="dashboard-loading">
          {[...Array(7)].map((_, i) => <div key={i} className="skeleton-row" />)}
        </div>
      ) : statsError ? (
        <div className="dashboard-error">
          <span>⚠️</span>
          <span>Failed to load stats.</span>
          <button onClick={refetchStats} className="btn-action" style={{ marginLeft: "auto" }}>Retry</button>
        </div>
      ) : stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-card__icon">{STAT_ICONS.totalUsers}</span>
            <span>{stats.totalUsers.toLocaleString()}</span>
            <label>Total Users</label>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon">{STAT_ICONS.totalArtworks}</span>
            <span>{stats.totalArtworks.toLocaleString()}</span>
            <label>Total Artworks</label>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon">{STAT_ICONS.totalOrders}</span>
            <span>{stats.totalOrders.toLocaleString()}</span>
            <label>Total Orders</label>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon">{STAT_ICONS.totalRevenue}</span>
            <span>{formatPrice(stats.totalRevenue)}</span>
            <label>Total Revenue</label>
          </div>
          <div className="stat-card highlight">
            <span className="stat-card__icon">{STAT_ICONS.pendingSubmissions}</span>
            <span>{stats.pendingSubmissions}</span>
            <label>Pending Submissions</label>
          </div>
          <div className="stat-card highlight">
            <span className="stat-card__icon">{STAT_ICONS.pendingOrders}</span>
            <span>{stats.pendingOrders}</span>
            <label>Pending Orders</label>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon">{STAT_ICONS.customPrintOrders}</span>
            <span>{stats.customPrintOrders.toLocaleString()}</span>
            <label>Custom Print Orders</label>
          </div>
        </div>
      )}

      {/* Charts section */}
      {chartsLoading ? (
        <div className="chart-loading">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton-row" />)}
        </div>
      ) : chartsError ? (
        <div className="dashboard-error">
          <span>⚠️</span>
          <span>Failed to load charts.</span>
          <button onClick={refetchCharts} className="btn-action" style={{ marginLeft: "auto" }}>Retry</button>
        </div>
      ) : charts && (
        <div className="chart-grid">
          <section className="chart-card">
            <h3>Monthly Revenue</h3>
            {charts.monthly.length > 0 ? (
              <Bars label="Monthly revenue" data={charts.monthly.map((m) => ({ label: m.month, value: m.revenue }))} />
            ) : (
              <p className="muted" style={{ padding: "2rem 0", textAlign: "center" }}>No data yet.</p>
            )}
          </section>

          <section className="chart-card">
            <h3>Monthly Orders</h3>
            {charts.monthly.length > 0 ? (
              <Bars label="Monthly orders" data={charts.monthly.map((m) => ({ label: m.month, value: m.orders }))} />
            ) : (
              <p className="muted" style={{ padding: "2rem 0", textAlign: "center" }}>No data yet.</p>
            )}
          </section>

          <section className="chart-card">
            <h3>Popular Artworks</h3>
            {charts.popularArtworks.length > 0 ? (
              <ul className="rank-list">
                {charts.popularArtworks.map((a) => (
                  <li key={a.artworkId}>
                    <img src={imageUrl(a.imageUrl)} alt="" width={40} height={40} />
                    <span>{a.title}</span>
                    <span className="muted">{a.unitsSold} sold</span>
                    <strong>{formatPrice(a.revenue)}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted" style={{ padding: "2rem 0", textAlign: "center" }}>No sales yet.</p>
            )}
          </section>

          <section className="chart-card">
            <h3>Sales by Category</h3>
            {charts.salesByCategory.length > 0 ? (
              <ul className="rank-list">
                {charts.salesByCategory.map((c) => (
                  <li key={c.category}>
                    <span>{c.category}</span>
                    <span className="muted">{c.unitsSold} units</span>
                    <strong>{formatPrice(c.revenue)}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted" style={{ padding: "2rem 0", textAlign: "center" }}>No sales yet.</p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
