import { Link, useSearchParams } from "react-router-dom";
import { useGetSubmissionsQuery, type SubmissionStatus } from "../../features/submissions/submissionsApi";
import Pagination from "../../components/Pagination";
import { formatPrice, imageUrl } from "../../utils/image";

const TABS: (SubmissionStatus | "All")[] = ["Pending", "Approved", "Rejected", "All"];

export default function AdminSubmissions() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get("status") ?? "Pending") as SubmissionStatus | "All";
  const page = Number(params.get("page") ?? 1);

  const { data, isLoading, isFetching, isError, refetch } = useGetSubmissionsQuery({
    status: tab === "All" ? undefined : tab, page, pageSize: 10,
  });
  const result = data?.data;

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? "rgba(200,255,0,0.15)" : "none",
    color: active ? "#C8FF00" : "#5a8070",
    border: active ? "1px solid rgba(200,255,0,0.3)" : "1px solid rgba(200,255,0,0.08)",
    borderRadius: "7px",
    padding: "0.4rem 1rem",
    fontSize: "0.85rem",
    fontWeight: active ? 700 : 500,
    boxShadow: "none",
  });

  return (
    <main>
      <h1 style={{ marginBottom: "1.5rem" }}>Artwork Submissions</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            style={tabBtnStyle(tab === t)}
            onClick={() => setParams({ status: t })}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading && <p className="muted">Loading submissions…</p>}
      {isError && (
        <p className="muted">Could not load submissions. <button onClick={refetch}>Try again</button></p>
      )}
      {result && result.items.length === 0 && (
        <p className="muted">No {tab === "All" ? "" : tab.toLowerCase()} submissions.</p>
      )}

      {result && result.items.length > 0 && (
        <table style={{ opacity: isFetching ? 0.6 : 1 }}>
          <thead>
            <tr>
              <th></th>
              <th>Title</th>
              <th>Submitter</th>
              <th>Price</th>
              <th>Status</th>
              <th>Submitted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((s) => (
              <tr key={s.submissionId}>
                <td>
                  <img src={imageUrl(s.imageUrl)} alt="" width={48} height={48}
                    style={{ objectFit: "cover", borderRadius: "6px" }} />
                </td>
                <td style={{ color: "#d4e8d8" }}>{s.title}</td>
                <td>
                  {s.submitterName}<br />
                  <small className="muted">{s.email}</small>
                </td>
                <td style={{ color: "#C8FF00" }}>{formatPrice(s.originalPrice)}</td>
                <td><span className={`badge badge--${s.status.toLowerCase()}`}>{s.status}</span></td>
                <td>{new Date(s.submittedAt).toLocaleDateString()}</td>
                <td><Link to={`/admin/submissions/${s.submissionId}`}>Review →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {result && (
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          onChange={(p) => setParams({ status: tab, page: String(p) })}
        />
      )}
    </main>
  );
}