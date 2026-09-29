import { Link, useSearchParams } from "react-router-dom";
import { useArchiveArtworkMutation, useGetAdminArtworksQuery } from "../../features/artworks/artworksApi";
import Pagination from "../../components/Pagination";
import { formatPrice, imageUrl } from "../../utils/image";

export default function AdminArtworks() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") ?? 1);
  const search = params.get("search") ?? "";
  const { data, isLoading } = useGetAdminArtworksQuery({ search: search || undefined, page, pageSize: 15 });
  const [archive] = useArchiveArtworkMutation();
  const result = data?.data;

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ margin: 0 }}>Artworks</h1>
        <Link to="/admin/artworks/new" className="button">+ New artwork</Link>
      </div>

      <input
        type="search"
        placeholder="Search artworks…"
        defaultValue={search}
        onBlur={(e) => setParams({ search: e.target.value })}
        style={{ maxWidth: "320px", marginBottom: "1.25rem" }}
      />

      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Title</th>
              <th>Category</th>
              <th>From</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {result?.items.map((a) => (
              <tr key={a.artworkId}>
                <td>
                  <img src={imageUrl(a.thumbnailUrl ?? a.imageUrl)} alt="" width={44} height={44}
                    style={{ objectFit: "cover", borderRadius: "6px" }} />
                </td>
                <td style={{ color: "#d4e8d8" }}>{a.title}</td>
                <td>{a.category}</td>
                <td style={{ color: "#C8FF00" }}>{formatPrice(a.fromPrice)}</td>
                <td><span className={`badge badge--${a.status.toLowerCase()}`}>{a.status}</span></td>
                <td>{a.reviewCount > 0 ? `★ ${a.averageRating.toFixed(1)}` : "—"}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <Link to={`/admin/artworks/${a.artworkId}`}>Edit</Link>
                  {a.status !== "Archived" && (
                    <button
                      onClick={() => window.confirm("Archive this artwork?") && archive(a.artworkId)}
                      style={{ background: "none", color: "#ff8080", border: "1px solid rgba(255,128,128,0.3)", padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                    >
                      Archive
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {result && (
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          onChange={(p) => setParams({ search, page: String(p) })}
        />
      )}
    </main>
  );
}