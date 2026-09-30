import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  useArchiveArtworkMutation,
  useGetAdminArtworksQuery,
  useGetAdminArtworkQuery,
  useUpdateArtworkMutation,
} from "../../features/artworks/artworksApi";
import Pagination from "../../components/Pagination";
import { formatPrice, imageUrl } from "../../utils/image";
import ConfirmDialog from "../../components/ConfirmDialog";
import { showToast } from "../../components/Toast";
import { getErrorMessage } from "../../utils/errors";

// Mini hook: fetch + publish a single artwork by id
function usePublishArtwork() {
  const [targetId, setTargetId] = useState<number | null>(null);
  const { data } = useGetAdminArtworkQuery(targetId!, { skip: targetId === null });
  const [update, { isLoading }] = useUpdateArtworkMutation();

  const publish = async (id: number) => {
    setTargetId(id);
  };

  // Once we have the artwork data, publish it
  const doPublish = async (title: string) => {
    if (!targetId || !data?.data) return;
    try {
      const a = data.data;
      await update({
        id: targetId,
        body: {
          title: a.title,
          description: a.description,
          categoryId: a.categoryId,
          imageUrl: a.imageUrl,
          thumbnailUrl: a.thumbnailUrl ?? a.imageUrl,
          artworkType: a.artworkType,
          originalPrice: a.originalPrice,
          isOriginalAvailable: a.isOriginalAvailable,
          isPrintAvailable: a.isPrintAvailable,
          status: "Published",
          variants: a.variants.map((v) => ({
            variantType: v.variantType,
            basePrice: v.basePrice,
            stockQuantity: v.stockQuantity,
            isAvailable: v.isAvailable,
          })),
        },
      }).unwrap();
      showToast(`"${title}" is now published.`, "success");
    } catch (e) {
      showToast(getErrorMessage(e), "error");
    } finally {
      setTargetId(null);
    }
  };

  return { publish, doPublish, isLoading, ready: !!data?.data, targetId };
}

export default function AdminArtworks() {
  const [params, setParams] = useSearchParams();
  const [archiveTarget, setArchiveTarget] = useState<{ id: number; title: string } | null>(null);
  const [publishTarget, setPublishTarget] = useState<{ id: number; title: string } | null>(null);
  const publisher = usePublishArtwork();

  const page = Number(params.get("page") ?? 1);
  const search = params.get("search") ?? "";
  const { data, isLoading, isError, refetch } = useGetAdminArtworksQuery({ search: search || undefined, page, pageSize: 15 });
  const [archive] = useArchiveArtworkMutation();
  const result = data?.data;

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archive(archiveTarget.id).unwrap();
      showToast(`"${archiveTarget.title}" archived.`, "info");
    } catch (e) {
      showToast(getErrorMessage(e), "error");
    } finally {
      setArchiveTarget(null);
    }
  };

  const handlePublish = async () => {
    if (!publishTarget) return;
    await publisher.publish(publishTarget.id);
    await publisher.doPublish(publishTarget.title);
    setPublishTarget(null);
  };

  return (
    <main>
      <div className="page-header">
        <h1>Artworks</h1>
        <Link to="/admin/artworks/new" className="button">+ New artwork</Link>
      </div>

      {/* Search */}
      <div className="search-row">
        <div className="search-input-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search artworks…"
            defaultValue={search}
            className="search-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setParams({ search: (e.target as HTMLInputElement).value });
              }
            }}
            onBlur={(e) => setParams({ search: e.target.value })}
          />
        </div>
      </div>

      {isLoading && (
        <div className="table-loading">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton-row" />)}
        </div>
      )}

      {isError && (
        <div className="state-card state-card--error">
          <p>Failed to load artworks.</p>
          <button onClick={refetch}>Try again</button>
        </div>
      )}

      {!isLoading && !isError && result && (
        <>
          {result.items.length === 0 ? (
            <div className="state-card">
              <div className="state-card__icon">🎨</div>
              <p className="muted">No artworks found{search ? ` for "${search}"` : ""}.</p>
              {search && (
                <button onClick={() => setParams({ search: "" })}>Clear search</button>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
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
                  {result.items.map((a) => (
                    <tr key={a.artworkId}>
                      <td style={{ width: "60px" }}>
                        <img
                          src={imageUrl(a.thumbnailUrl ?? a.imageUrl)}
                          alt=""
                          width={44}
                          height={44}
                          style={{ objectFit: "cover", borderRadius: "6px", display: "block" }}
                        />
                      </td>
                      <td className="user-name">{a.title}</td>
                      <td className="muted">{a.category}</td>
                      <td style={{ color: "#C8FF00" }}>{formatPrice(a.fromPrice)}</td>
                      <td>
                        <span className={`badge badge--${a.status.toLowerCase()}`}>{a.status}</span>
                      </td>
                      <td className="muted">
                        {a.reviewCount > 0 ? `★ ${a.averageRating.toFixed(1)} (${a.reviewCount})` : "—"}
                      </td>
                      <td>
                        <div className="action-btns">
                          <Link to={`/admin/artworks/${a.artworkId}`} className="btn-action">Edit</Link>
                          {(a.status === "Draft" || a.status === "Unpublished") && (
                            <button
                              onClick={() => setPublishTarget({ id: a.artworkId, title: a.title })}
                              className="btn-action btn-action--success"
                            >
                              Publish
                            </button>
                          )}
                          {a.status !== "Archived" && (
                            <button
                              onClick={() => setArchiveTarget({ id: a.artworkId, title: a.title })}
                              className="btn-action btn-action--danger"
                            >
                              Archive
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
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onChange={(p) => setParams({ search, page: String(p) })}
          />
        </>
      )}

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive Artwork"
        message={`Archive "${archiveTarget?.title}"? It will be hidden from the shop.`}
        confirmLabel="Archive"
        confirmDanger
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />

      <ConfirmDialog
        open={!!publishTarget}
        title="Publish Artwork"
        message={`Publish "${publishTarget?.title}"? It will become visible in the shop immediately.`}
        confirmLabel="Publish"
        confirmDanger={false}
        onConfirm={handlePublish}
        onCancel={() => setPublishTarget(null)}
      />
    </main>
  );
}
