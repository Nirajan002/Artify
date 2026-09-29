import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  useAddToWishlistMutation, useGetWishlistQuery, useRemoveFromWishlistMutation,
} from "../features/wishlist/wishlistApi";

export default function WishlistButton({ artworkId }: { artworkId: number }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const [add, { isLoading: adding }] = useAddToWishlistMutation();
  const [remove, { isLoading: removing }] = useRemoveFromWishlistMutation();

  const inWishlist = !!data?.data.some((a) => a.artworkId === artworkId);

  const toggle = () => {
    if (!isAuthenticated) { navigate("/login", { state: { from: location } }); return; }
    return inWishlist ? remove(artworkId) : add(artworkId);
  };

  return (
    <button
      onClick={toggle}
      disabled={adding || removing}
      aria-pressed={inWishlist}
      style={{
        background: inWishlist ? "rgba(200,255,0,0.1)" : "none",
        color: inWishlist ? "#C8FF00" : "#8ab89e",
        border: `1.5px solid ${inWishlist ? "rgba(200,255,0,0.35)" : "rgba(200,255,0,0.15)"}`,
        fontWeight: 600,
        boxShadow: "none",
      }}
    >
      {inWishlist ? "♥ In your wishlist" : "♡ Add to wishlist"}
    </button>
  );
}