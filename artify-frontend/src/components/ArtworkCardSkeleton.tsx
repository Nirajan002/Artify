export default function ArtworkCardSkeleton() {
  return (
    <div className="art-card art-card--skeleton" aria-hidden="true">
      <div className="art-card__frame skeleton-block" style={{ aspectRatio: "3/4" }} />
      <div style={{ padding: "0.75rem 0.5rem 0.25rem" }}>
        <div className="skeleton-line" style={{ width: "75%", height: "14px" }} />
        <div className="skeleton-line" style={{ width: "45%", height: "11px", marginTop: "6px" }} />
        <div className="skeleton-line" style={{ width: "55%", height: "11px", marginTop: "5px" }} />
      </div>
    </div>
  );
}