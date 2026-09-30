import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useApproveSubmissionMutation, useGetSubmissionQuery, useRejectSubmissionMutation,
} from "../../features/submissions/submissionsApi";
import { formatPrice, imageUrl } from "../../utils/image";
import { humanize } from "../../utils/constants";
import { getErrorMessage } from "../../utils/errors";
import ConfirmDialog from "../../components/ConfirmDialog";
import { showToast } from "../../components/Toast";

export default function AdminSubmissionDetail() {
  const { id } = useParams();
  const subId = Number(id);
  const { data, isLoading, isError } = useGetSubmissionQuery(subId, { skip: !id });
  const [approve, { isLoading: approving }] = useApproveSubmissionMutation();
  const [reject, { isLoading: rejecting }] = useRejectSubmissionMutation();

  const [showReject, setShowReject] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (isLoading) {
    return (
      <main>
        <div className="table-loading">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton-row" style={{ height: "60px" }} />)}
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main>
        <div className="state-card state-card--error">
          <p>Submission not found.</p>
          <Link to="/admin/submissions" className="btn-action">← Back</Link>
        </div>
      </main>
    );
  }

  const s = data.data;
  const isPending = s.status === "Pending";

  const onApprove = async () => {
    setShowApproveConfirm(false);
    setError("");
    try {
      await approve({ id: subId }).unwrap();
      showToast(`"${s.title}" approved and published in the shop.`, "success");
    } catch (e) {
      setError(getErrorMessage(e));
      showToast(getErrorMessage(e), "error");
    }
  };

  const onReject = async () => {
    if (reason.trim().length < 5) {
      setError("Please give a rejection reason (at least 5 characters).");
      return;
    }
    setError("");
    try {
      await reject({ id: subId, reason: reason.trim() }).unwrap();
      setShowReject(false);
      showToast(`"${s.title}" rejected.`, "info");
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <main>
      <Link to="/admin/submissions" className="back-link" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>
        ← Back to submissions
      </Link>

      <div className="submission-detail-grid">
        {/* Image */}
        <div className="submission-image">
          <img
            src={imageUrl(s.imageUrl)}
            alt={s.title}
          />
        </div>

        <div className="submission-info">
          <div>
            <span className={`badge badge--${s.status.toLowerCase()}`} style={{ marginBottom: "0.75rem", display: "inline-flex" }}>
              {s.status}
            </span>
            <h1 style={{ fontSize: "1.75rem", marginTop: "0.25rem" }}>{s.title}</h1>
          </div>

          {/* Submitter */}
          <div className="detail-card">
            <h3 className="detail-label" style={{ marginBottom: "0.75rem" }}>Submitter</h3>
            <p className="user-name">{s.submitterName}</p>
            <p className="muted">{s.email}</p>
            <p className="muted">{s.phoneNumber}</p>
          </div>

          {/* Artwork details */}
          <div className="detail-card">
            <h3 className="detail-label" style={{ marginBottom: "0.75rem" }}>Artwork Details</h3>
            <p style={{ color: "#8ab89e", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
              {s.category} · {humanize(s.artworkType)} ·{" "}
              <strong style={{ color: "#C8FF00" }}>{formatPrice(s.originalPrice)}</strong>
            </p>
            <p style={{ color: "#8ab89e", fontSize: "0.9rem", lineHeight: 1.6 }}>{s.description}</p>
            {s.additionalInformation && (
              <>
                <p className="detail-label" style={{ marginTop: "1rem" }}>Additional info</p>
                <p style={{ color: "#8ab89e", fontSize: "0.875rem" }}>{s.additionalInformation}</p>
              </>
            )}
          </div>

          {/* Review history */}
          {!isPending && (
            <div className="detail-card">
              <h3 className="detail-label" style={{ marginBottom: "0.75rem" }}>Review Decision</h3>
              <p style={{ color: "#8ab89e", fontSize: "0.9rem" }}>
                {s.status} on {s.reviewedAt && new Date(s.reviewedAt).toLocaleString()}
              </p>
              {s.adminComment && (
                <p style={{ color: "#8ab89e", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                  Note: {s.adminComment}
                </p>
              )}
              {s.artworkId && (
                <Link
                  to={`/artworks/${s.artworkId}`}
                  style={{ color: "#C8FF00", fontSize: "0.875rem", display: "inline-block", marginTop: "0.75rem" }}
                >
                  View published artwork →
                </Link>
              )}
            </div>
          )}

          {/* Actions */}
          {isPending && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {!showReject ? (
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => setShowApproveConfirm(true)}
                    disabled={approving}
                    style={{ flex: 1, padding: "0.75rem" }}
                  >
                    {approving ? "Approving…" : "✓ Approve"}
                  </button>
                  <button
                    className="danger"
                    onClick={() => setShowReject(true)}
                    style={{ flex: 1, padding: "0.75rem" }}
                  >
                    ✕ Reject
                  </button>
                </div>
              ) : (
                <div className="detail-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <h3 className="detail-label">Reason for rejection</h3>
                  <label className="field">
                    <span>Reason (required, min 5 characters)</span>
                    <textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Image quality is too low for printing."
                    />
                  </label>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button className="danger" onClick={onReject} disabled={rejecting} style={{ flex: 1 }}>
                      {rejecting ? "Rejecting…" : "Confirm rejection"}
                    </button>
                    <button
                      onClick={() => { setShowReject(false); setError(""); setReason(""); }}
                      style={{ background: "none", color: "#5a8070", border: "1px solid rgba(200,255,0,0.1)", boxShadow: "none" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <p className="error" role="alert">{error}</p>}
        </div>
      </div>

      <ConfirmDialog
        open={showApproveConfirm}
        title="Approve Submission"
        message={`Approve "${s.title}" and publish it in the shop?`}
        confirmLabel="Approve & Publish"
        onConfirm={onApprove}
        onCancel={() => setShowApproveConfirm(false)}
      />
    </main>
  );
}
