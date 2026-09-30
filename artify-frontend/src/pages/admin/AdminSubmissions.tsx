import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useGetSubmissionsQuery, type SubmissionStatus } from "../../features/submissions/submissionsApi";
import Pagination from "../../components/Pagination";
import { formatPrice, imageUrl } from "../../utils/image";

const TABS: (SubmissionStatus | "All")[] = ["Pending", "Approved", "Rejected", "All"];

export default function AdminSubmissions() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [inputVal, setInputVal] = useState("");

  const tab = (params.get("status") ?? "Pending") as SubmissionStatus | "All";
  const page = Number(params.get("page") ?? 1);

  const { data, isLoading, isFetching, isError, refetch } = useGetSubmissionsQuery({
    status: tab === "All" ? undefined : tab,
    search: search || undefined,
    page,
    pageSize: 10,
  });
  const result = data?.data;

  const handleSearch = () => {
    setSearch(inputVal.trim());
    setParams({ status: tab, page: "1" });
  };

  return (
    <main>
      <div className="page-header">
        <h1>Artwork Submissions</h1>
        {result && <span className="page-header__count">{result.totalCount} submissions</span>}
      </div>

      {/* Tabs */}
      <div className="tab-row">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`tab-btn ${tab === t ? "tab-btn--active" : ""}`}
            onClick={() => setParams({ status: t, page: "1" })}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="search-row">
        <div className="search-input-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search by title or submitter…"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="search-input"
          />
        </div>
        <button onClick={handleSearch} className="search-btn">Search</button>
        {search && (
          <button onClick={() => { setInputVal(""); setSearch(""); }} className="search-clear">
            Clear
          </button>
        )}
      </div>

      {isLoading && (
        <div className="table-loading">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton-row" />)}
        </div>
      )}

      {isError && (
        <div className="state-card state-card--error">
          <p>Could not load submissions.</p>
          <button onClick={refetch}>Try again</button>
        </div>
      )}

      {!isLoading && !isError && result && (
        <>
          {result.items.length === 0 ? (
            <div className="state-card">
              <div className="state-card__icon">📥</div>
              <p>No {tab === "All" ? "" : tab.toLowerCase()} submissions</p>
              {search && (
                <p className="muted">No results for "{search}"</p>
              )}
              {search && (
                <button onClick={() => { setInputVal(""); setSearch(""); }}>Clear search</button>
              )}
            </div>
          ) : (
            <div className="table-wrapper" style={{ opacity: isFetching ? 0.6 : 1, transition: "opacity 0.2s" }}>
              <table>
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
                      <td style={{ width: "60px" }}>
                        <img
                          src={imageUrl(s.imageUrl)}
                          alt=""
                          width={48}
                          height={48}
                          style={{ objectFit: "cover", borderRadius: "6px", display: "block" }}
                        />
                      </td>
                      <td className="user-name">{s.title}</td>
                      <td>
                        <span style={{ color: "#d4e8d8" }}>{s.submitterName}</span>
                        <br />
                        <small className="muted">{s.email}</small>
                      </td>
                      <td style={{ color: "#C8FF00" }}>{formatPrice(s.originalPrice)}</td>
                      <td>
                        <span className={`badge badge--${s.status.toLowerCase()}`}>{s.status}</span>
                      </td>
                      <td className="muted">{new Date(s.submittedAt).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/admin/submissions/${s.submissionId}`} className="btn-action">
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onChange={(p) => setParams({ status: tab, page: String(p) })}
          />
        </>
      )}
    </main>
  );
}
