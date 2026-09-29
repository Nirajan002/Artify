import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  useCreateReviewMutation, useDeleteReviewMutation, useGetReviewEligibilityQuery,
  useGetReviewsQuery, useUpdateReviewMutation,
} from "../features/reviews/reviewsApi";
import { StarDisplay, StarInput } from "./StarRating";
import { getErrorMessage } from "../utils/errors";

export default function ReviewSection({ artworkId }: { artworkId: number }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const { data: summaryRes, isLoading } = useGetReviewsQuery(artworkId);
  const { data: eligRes } = useGetReviewEligibilityQuery(artworkId, { skip: !isAuthenticated });
  const [create, { isLoading: creating }] = useCreateReviewMutation();
  const [update, { isLoading: updating }] = useUpdateReviewMutation();
  const [remove] = useDeleteReviewMutation();

  const summary = summaryRes?.data;
  const eligibility = eligRes?.data;

  const [editing, setEditing] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const startEditing = () => {
    setRating(eligibility?.rating ?? 0);
    setComment(eligibility?.comment ?? "");
    setOrderId(eligibility?.eligibleOrders[0]?.orderId ?? null);
    setEditing(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (rating < 1) { setError("Choose a star rating"); return; }
    try {
      if (eligibility?.alreadyReviewed && eligibility.existingReviewId) {
        await update({ artworkId, reviewId: eligibility.existingReviewId, body: { orderId: orderId!, rating, comment } }).unwrap();
      } else {
        if (!orderId) { setError("Select which order this review is for"); return; }
        await create({ artworkId, body: { orderId, rating, comment } }).unwrap();
      }
      setEditing(false);
    } catch (e2) { setError(getErrorMessage(e2)); }
  };

  const onDelete = async () => {
    if (!eligibility?.existingReviewId || !window.confirm("Delete your review?")) return;
    try { await remove({ artworkId, reviewId: eligibility.existingReviewId }).unwrap(); } catch (e) { setError(getErrorMessage(e)); }
  };

  if (isLoading) return <p className="muted">Loading reviews…</p>;
  if (!summary) return null;

  return (
    <section className="reviews">
      <h2>Reviews</h2>

      {/* Summary */}
      <div className="reviews__summary">
        <span className="reviews__avg">{summary.averageRating.toFixed(1)}</span>
        <div style={{ flex: 1 }}>
          <StarDisplay value={summary.averageRating} />
          <p className="muted" style={{ marginTop: "0.25rem" }}>{summary.reviewCount} review{summary.reviewCount !== 1 && "s"}</p>
        </div>
        <div className="reviews__breakdown">
          {[5, 4, 3, 2, 1].map((n) => (
            <div key={n} className="reviews__bar-row">
              <span>{n}★</span>
              <div className="reviews__bar">
                <div style={{
                  width: summary.reviewCount ? `${(summary.breakdown[n] / summary.reviewCount) * 100}%` : "0%",
                }} />
              </div>
              <span className="muted">{summary.breakdown[n]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write review prompt */}
      {isAuthenticated && eligibility && !editing && (
        eligibility.canReview ? (
          <button onClick={startEditing} style={{ marginBottom: "1rem" }}>
            {eligibility.alreadyReviewed ? "Edit your review" : "Write a review"}
          </button>
        ) : (
          <p className="muted" style={{ marginBottom: "1rem" }}>{eligibility.reason}</p>
        )
      )}
      {!isAuthenticated && (
        <p className="muted" style={{ marginBottom: "1rem" }}>
          <Link to="/login" state={{ from: location }}>Log in</Link> to review artwork you've purchased.
        </p>
      )}

      {/* Edit form */}
      {editing && eligibility && (
        <form onSubmit={onSubmit} className="submit-form review-form" style={{ marginBottom: "2rem" }}>
          <h3 style={{ color: "#C8FF00", fontSize: "1rem", margin: "0 0 0.5rem" }}>Your review</h3>
          <StarInput value={rating} onChange={setRating} />

          {!eligibility.alreadyReviewed && eligibility.eligibleOrders.length > 1 && (
            <label className="field">
              <span>Which order is this for?</span>
              <select value={orderId ?? ""} onChange={(e) => setOrderId(Number(e.target.value))}>
                {eligibility.eligibleOrders.map((o) => (
                  <option key={o.orderId} value={o.orderId}>
                    {o.orderNumber} — {new Date(o.deliveredOrPlacedAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="field">
            <span>Comment (optional)</span>
            <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} />
          </label>

          {error && <p className="error" role="alert">{error}</p>}

          <div>
            <button type="submit" disabled={creating || updating}>
              {eligibility.alreadyReviewed ? "Update review" : "Submit review"}
            </button>
            <button type="button" onClick={() => setEditing(false)}
              style={{ background: "none", color: "#5a8070", border: "1px solid rgba(200,255,0,0.1)" }}>
              Cancel
            </button>
            {eligibility.alreadyReviewed && (
              <button type="button" className="danger" onClick={onDelete}>Delete review</button>
            )}
          </div>
        </form>
      )}

      {/* Reviews list */}
      <ul className="reviews__list">
        {summary.reviews.map((r) => (
          <li key={r.reviewId}>
            <div className="reviews__list-head">
              <strong>{r.reviewerName}</strong>
              <StarDisplay value={r.rating} />
              <span className="muted">{new Date(r.createdAt).toLocaleDateString()}{r.updatedAt && " (edited)"}</span>
            </div>
            {r.comment && <p style={{ color: "#8ab89e", fontSize: "0.9rem" }}>{r.comment}</p>}
          </li>
        ))}
        {summary.reviews.length === 0 && (
          <p className="muted">No reviews yet. Be the first to review this artwork.</p>
        )}
      </ul>
    </section>
  );
}