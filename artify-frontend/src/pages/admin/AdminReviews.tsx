import { useState } from "react";
import { useGetAdminReviewsQuery, useSetReviewApprovalMutation, useDeleteAdminReviewMutation } from "../../features/admin/adminApi";
import Pagination from "../../components/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog";
import { StarDisplay } from "../../components/StarRating";
import { showToast } from "../../components/Toast";
import { getErrorMessage } from "../../utils/errors";
import { imageUrl } from "../../utils/image";

const FILTER_OPTIONS = [
  { value: undefined, label: "All reviews" },
  { value: true, label: "Approved" },
  { value: false, label: "Pending" },
];

export default function AdminReviews() {
  const [page, setPage] = useState(1);
  const [isApproved, setIsApproved] = useState<boolean | undefined>(undefined);
  const [confirmApproval, setConfirmApproval] = useState<{ id: number; title: string; approve: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; title: string } | null>(null);

  const { data, isLoading, isError, refetch } = useGetAdminReviewsQuery({ isApproved, page });
  const [setApproval, { isLoading: approving }] = useSetReviewApprovalMutation();
  const [deleteReview, { isLoading: deleting }] = useDeleteAdminReviewMutation();
  const result = data?.data;

  const handleApprovalToggle = async () => {
    if (!confirmApproval) return;
    try {
      await setApproval({ id: confirmApproval.id, isApproved: confirmApproval.approve }).unwrap();
      showToast(
        confirmApproval.approve
          ? `Review for "${confirmApproval.title}" has been approved.`
          : `Review for "${confirmApproval.title}" has been rejected.`,
        confirmApproval.approve ? "success" : "info"
      );
    } catch (e) {
      showToast(getErrorMessage(e), "error");
    } finally {
      setConfirmApproval(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteReview(confirmDelete.id).unwrap();
      showToast(`Review for "${confirmDelete.title}" has been deleted.`, "success");
    } catch (e) {
      showToast(getErrorMessage(e), "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <main>
      <div className="page-header">
        <h1>Reviews</h1>
        {result && (
          <span className="page-header__count">{result.totalCount} reviews</span>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="table-toolbar">
        <select
          value={isApproved === undefined ? "" : String(isApproved)}
          onChange={(e) => {
            const val = e.target.value;
            setIsApproved(val === "" ? undefined : val === "true");
            setPage(1);
          }}
          className="filter-select"
          aria-label="Filter by approval status"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="table-loading">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-row" />
          ))}
        </div>
      )}

      {isError && (
        <div className="state-card state-card--error">
          <p>Failed to load reviews.</p>
          <button onClick={refetch}>Try again</button>
        </div>
      )}

      {!isLoading && !isError && result && (
        <>
          {result.items.length === 0 ? (
            <div className="state-card">
              <div className="state-card__icon">⭐</div>
              <p className="muted">
                {isApproved === undefined
                  ? "No reviews found."
                  : isApproved
                  ? "No approved reviews found."
                  : "No pending reviews found."}
              </p>
              {isApproved !== undefined && (
                <button onClick={() => { setIsApproved(undefined); setPage(1); }}>
                  Show all reviews
                </button>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Artwork</th>
                    <th>Reviewer</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((r) => (
                    <tr key={r.reviewId}>
                      <td>
                        <div className="admin-review-artwork">
                          {r.artworkImageUrl && (
                            <img
                              src={imageUrl(r.artworkImageUrl)}
                              alt={r.artworkTitle}
                              className="admin-review-artwork__img"
                            />
                          )}
                          <div className="admin-review-artwork__title">{r.artworkTitle}</div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="user-name">{r.reviewerName}</div>
                          <div className="muted small">{r.reviewerEmail}</div>
                        </div>
                      </td>
                      <td>
                        <StarDisplay value={r.rating} />
                      </td>
                      <td>
                        <div className="admin-review-comment">
                          {r.comment || <span className="muted">—</span>}
                        </div>
                      </td>
                      <td className="muted small">{r.orderNumber}</td>
                      <td className="muted small">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-dot ${r.isApproved ? "status-dot--active" : "status-dot--pending"}`}>
                          {r.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-review-actions">
                          {!r.isApproved && (
                            <button
                              onClick={() =>
                                setConfirmApproval({ id: r.reviewId, title: r.artworkTitle, approve: true })
                              }
                              disabled={approving || deleting}
                              className="btn-action btn-action--success"
                              title="Approve review"
                            >
                              ✓
                            </button>
                          )}
                          {r.isApproved && (
                            <button
                              onClick={() =>
                                setConfirmApproval({ id: r.reviewId, title: r.artworkTitle, approve: false })
                              }
                              disabled={approving || deleting}
                              className="btn-action btn-action--warning"
                              title="Reject review"
                            >
                              ✕
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmDelete({ id: r.reviewId, title: r.artworkTitle })}
                            disabled={approving || deleting}
                            className="btn-action btn-action--danger"
                            title="Delete review"
                          >
                            🗑
                          </button>
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
            onChange={(p) => setPage(p)}
          />
        </>
      )}

      <ConfirmDialog
        open={!!confirmApproval}
        title={confirmApproval?.approve ? "Approve Review" : "Reject Review"}
        message={
          confirmApproval?.approve
            ? `Approve this review for "${confirmApproval?.title}"? It will be visible to all users.`
            : `Reject this review for "${confirmApproval?.title}"? It will be hidden from users.`
        }
        confirmLabel={confirmApproval?.approve ? "Approve" : "Reject"}
        confirmDanger={!confirmApproval?.approve}
        onConfirm={handleApprovalToggle}
        onCancel={() => setConfirmApproval(null)}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Review"
        message={`Permanently delete this review for "${confirmDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmDanger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </main>
  );
}
