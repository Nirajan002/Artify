import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetArtworkQuery } from "../features/artworks/artworksApi";
import { formatPrice, imageUrl } from "../utils/image";
import AddToCartButton from "../components/AddToCartButton";
import WishlistButton from "../components/WishlistButton";
import ReviewSection from "../components/ReviewSection";

const LABELS: Record<string, string> = {
  Original: "Original painting",
  Poster: "Poster print",
  Canvas: "Canvas print",
  FramedPrint: "Framed print",
};

export default function ArtworkDetails() {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetArtworkQuery(Number(id), { skip: !id });
  const artwork = data?.data;
  const [variantId, setVariantId] = useState<number | null>(null);

  if (isLoading) return (
    <div className="page" style={{ textAlign: "center" }}>
      <p className="muted">Loading artwork…</p>
    </div>
  );
  if (isError || !artwork) return (
    <div className="page" style={{ textAlign: "center" }}>
      <p className="muted">Artwork not found.</p>
    </div>
  );

  const selectedVariantId =
    variantId ??
    artwork.variants.find((v) => v.isAvailable)?.artworkVariantId ??
    null;
  const selected = artwork.variants.find((v) => v.artworkVariantId === selectedVariantId);

  return (
    <main className="details">
      <div className="details__image">
        <img src={imageUrl(artwork.imageUrl)} alt={artwork.title} />
      </div>

      <div className="details__info">
        <p className="muted">
          {artwork.category} · {artwork.artworkType.replace(/([A-Z])/g, " $1").trim()}
        </p>
        <h1>{artwork.title}</h1>
        <p style={{ color: "#8ab89e", fontSize: "0.9rem" }}>
          {artwork.reviewCount > 0
            ? `★ ${artwork.averageRating.toFixed(1)} (${artwork.reviewCount} reviews)`
            : "No reviews yet"}
        </p>
        <p style={{ color: "#8ab89e", lineHeight: 1.7 }}>{artwork.description}</p>

        <fieldset>
          <legend>Choose a version</legend>
          {artwork.variants.map((v) => (
            <label
              key={v.artworkVariantId}
              className={v.stockQuantity < 1 ? "disabled" : ""}
            >
              <input
                type="radio"
                name="variant"
                disabled={!v.isAvailable || v.stockQuantity < 1}
                checked={selectedVariantId === v.artworkVariantId}
                onChange={() => setVariantId(v.artworkVariantId)}
              />
              {LABELS[v.variantType]} — {formatPrice(v.basePrice)}
              {v.stockQuantity < 1 && (
                <span className="muted"> (sold out)</span>
              )}
            </label>
          ))}
        </fieldset>

        {artwork.variants.every((v) => !v.isAvailable || v.stockQuantity < 1) && (
          <p className="error">All versions of this artwork are currently sold out.</p>
        )}

        <p className="price">{selected ? formatPrice(selected.basePrice) : "Unavailable"}</p>

        <AddToCartButton variantId={selected?.artworkVariantId} />
        <WishlistButton artworkId={artwork.artworkId} />
      </div>

      <ReviewSection artworkId={artwork.artworkId} />
    </main>
  );
}
