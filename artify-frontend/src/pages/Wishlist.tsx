import { Link } from "react-router-dom";
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from "../features/wishlist/wishlistApi";
import ArtworkCard from "../components/ArtworkCard";

export default function Wishlist() {
  const { data, isLoading, isError, refetch } = useGetWishlistQuery();
  const [remove] = useRemoveFromWishlistMutation();

  if (isLoading) return <div className="page" style={{ textAlign: "center" }}><p className="muted">Loading your wishlist…</p></div>;
  if (isError) return (
    <div className="page" style={{ textAlign: "center" }}>
      <p className="muted">Could not load your wishlist. <button onClick={refetch}>Try again</button></p>
    </div>
  );

  const items = data?.data ?? [];

  return (
    <main className="page">
      <h1>Your wishlist</h1>
      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <p className="muted" style={{ marginBottom: "1.5rem" }}>Nothing saved yet.</p>
          <Link to="/shop" className="button">Explore the shop</Link>
        </div>
      ) : (
        <div className="art-grid" style={{ marginTop: "1.5rem" }}>
          {items.map((a) => (
            <div key={a.artworkId} style={{ position: "relative" }}>
              <ArtworkCard artwork={a} />
              <button
                onClick={() => remove(a.artworkId)}
                style={{
                  marginTop: "0.5rem",
                  width: "100%",
                  background: "none",
                  color: "#5a8070",
                  border: "1px solid rgba(200,255,0,0.1)",
                  fontSize: "0.8rem",
                  padding: "0.35rem 0.75rem",
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}