import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useApproveSubmissionMutation, useGetSubmissionQuery, useRejectSubmissionMutation,
} from "../../features/submissions/submissionsApi";
import { formatPrice, imageUrl } from "../../utils/image";
import { humanize } from "../../utils/constants";
import { getErrorMessage } from "../../utils/errors";

export default function AdminSubmissionDetail() {
  const { id } = useParams();
  const subId = Number(id);
  const { data, isLoading, isError } = useGetSubmissionQuery(subId, { skip: !id });
  const [approve, { isLoading: approving }] = useApproveSubmissionMutation();
  const [reject, { isLoading: rejecting }] = useRejectSubmissionMutation();

  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (isLoading) return <div style={{ padding: "2rem" }}><p className="muted">Loading…</p></div>;
  if (isError || !data) return <div style={{ padding: "2rem" }}><p className="muted">Submission not found.</p></div>;

  const s = data.data;
  const isPending = s.status === "Pending";

  const onApprove = async () => {
    if (!window.confirm(`Approve "${s.title}" and publish it in the shop?`)) return;
    setError("");
    try { await approve({ id: subId }).unwrap(); } catch (e) { setError(getErrorMessage(e)); }
  };

  const onReject = async () => {
    if (reason.trim().length < 5) { setError("Please give a rejection reason (at least 5 characters)."); return; }
    setError("");
    try {
      await reject({ id: subId, reason: reason.trim() }).unwrap();
      setShowReject(false);
    } catch (e) { setError(getErrorMessage(e)); }
  };

  const cardStyle: React.CSSProperties = {
    background: "#0d1f17",
    border: "1px solid rgba(200,255,0,0.08)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.25rem",
  };

  return (
    <main>
      <Link to="/admin/submissions" style={{ color: "#5a8070", fontSize: "0.875rem", display: "inline-block", marginBottom: "1.5rem" }}>
        ← Back to submissions
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "2rem", alignItems: "start" }}>
        {/* Image */}
        <div>
          <img
            src={imageUrl(s.imageUrl)}
            alt={s.title}
            style={{ width: "100%", borderRadius: "12px", border: "1px solid rgba(200,255,0,0.1)" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <span className={`badge badge--${s.status.toLowerCase()}`} style={{ marginBottom: "0.75rem", display: "inline-flex" }}>
              {s.status}
            </span>
            <h1 style={{ fontSize: "1.75rem", marginTop: "0.25rem" }}>{s.title}</h1>
          </div>

          {/* Submitter */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#3a6048", marginBottom: "0.75rem" }}>
              Submitter
            </h3>
            <p style={{ color: "#d4e8d8", fontWeight: 600 }}>{s.submitterName}</p>
            <p className="muted">{s.email}</p>
            <p className="muted">{s.phoneNumber}</p>
          </div>

          {/* Artwork details */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#3a6048", marginBottom: "0.75rem" }}>
              Artwork details
            </h3>
            <p style={{ color: "#8ab89e", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
              {s.category} · {humanize(s.artworkType)} · <strong style={{ color: "#C8FF00" }}>{formatPrice(s.originalPrice)}</strong>
            </p>
            <p style={{ color: "#8ab89e", fontSize: "0.9rem", lineHeight: 1.6 }}>{s.description}</p>
            {s.additionalInformation && (
              <>
                <p style={{ color: "#5a8070", fontSize: "0.8rem", marginTop: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Additional info
                </p>
                <p style={{ color: "#8ab89e", fontSize: "0.875rem" }}>{s.additionalInformation}</p>
              </>
            )}
          </div>

          {/* Review history */}
          {!isPending && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#3a6048", marginBottom: "0.75rem" }}>
                Review
              </h3>
              <p style={{ color: "#8ab89e", fontSize: "0.9rem" }}>
                {s.status} on {s.reviewedAt && new Date(s.reviewedAt).toLocaleString()}
              </p>
              {s.adminComment && <p style={{ color: "#8ab89e", fontSize: "0.875rem", marginTop: "0.5rem" }}>Note: {s.adminComment}</p>}
              {s.artworkId && (
                <Link to={`/artworks/${s.artworkId}`} style={{ color: "#C8FF00", fontSize: "0.875rem", display: "inline-block", marginTop: "0.75rem" }}>
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
                  <button onClick={onApprove} disabled={approving} style={{ flex: 1, padding: "0.75rem" }}>
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
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <label className="field">
                    <span>Reason for rejection (required)</span>
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
                    <button onClick={() => { setShowReject(false); setError(""); }}
                      style={{ background: "none", color: "#5a8070", border: "1px solid rgba(200,255,0,0.1)" }}>
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
    </main>
  );
}