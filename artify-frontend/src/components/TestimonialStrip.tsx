import { StarDisplay } from "./StarRating";
import type { HomeReview } from "../features/artworks/artworksApi";

export default function TestimonialStrip({ reviews }: { reviews: HomeReview[] }) {
  if (reviews.length === 0) return null;
  return (
    <section className="home-section" style={{ borderTop: "1px solid rgba(200,255,0,0.07)", paddingTop: "3.5rem" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>What customers are saying</h2>
      <div className="testimonial-grid">
        {reviews.map((r, i) => (
          <blockquote key={i} className="testimonial">
            <StarDisplay value={r.rating} />
            <p>"{r.comment}"</p>
            <footer>— {r.reviewerName}, on <em style={{ color: "#C8FF00" }}>{r.artworkTitle}</em></footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}