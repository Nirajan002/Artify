import { Link } from "react-router-dom";
import type { Artwork } from "../features/artworks/artworksApi";
import ArtworkCard from "./ArtworkCard";

interface Props { title: string; subtitle?: string; artworks: Artwork[]; viewAllHref?: string }

export default function ArtworkCarouselSection({ title, subtitle, artworks, viewAllHref }: Props) {
  if (artworks.length === 0) return null;
  return (
    <section className="home-section">
      <div className="home-section__head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="muted" style={{ marginTop: "0.25rem" }}>{subtitle}</p>}
        </div>
        {viewAllHref && <Link to={viewAllHref} className="home-section__viewall">View all →</Link>}
      </div>
      <div className="art-row">
        {artworks.map((a) => (
          <ArtworkCard key={a.artworkId} artwork={a} />
        ))}
      </div>
    </section>
  );
}