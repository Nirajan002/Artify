import { Link } from "react-router-dom";
import type { Artwork } from "../features/artworks/artworksApi";
import { formatPrice, imageUrl } from "../utils/image";

export default function ArtworkCard({ artwork }: { artwork: Artwork }) {
  return (
    <Link to={`/artworks/${artwork.artworkId}`} className="art-card">
      <div className="art-card__frame">
        <img src={imageUrl(artwork.thumbnailUrl ?? artwork.imageUrl)} alt={artwork.title} loading="lazy" />
      </div>
      <div className="art-card__meta">
        <h3>{artwork.title}</h3>
        <p className="muted">{artwork.category}</p>
        <p style={{ fontSize: "0.85rem", color: "#d4e8d8", marginTop: "0.2rem" }}>
          From <strong style={{ color: "#C8FF00" }}>{formatPrice(artwork.fromPrice)}</strong>
          {artwork.reviewCount > 0 && (
            <span className="muted"> · ★ {artwork.averageRating.toFixed(1)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}