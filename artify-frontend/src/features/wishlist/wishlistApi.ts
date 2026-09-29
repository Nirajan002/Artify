import { api } from "../../services/api";
import type { ApiResponse } from "../../services/api";
import type { Artwork } from "../artworks/artworksApi";

export const wishlistApi = api.injectEndpoints({
  endpoints: (b) => ({
    getWishlist: b.query<ApiResponse<Artwork[]>, void>({
      query: () => "/wishlist",
      providesTags: ["Wishlist"],
    }),
    addToWishlist: b.mutation<ApiResponse<null>, number>({
      query: (artworkId) => ({ url: `/wishlist/${artworkId}`, method: "POST" }),
      invalidatesTags: ["Wishlist"],
    }),
    removeFromWishlist: b.mutation<ApiResponse<null>, number>({
      query: (artworkId) => ({ url: `/wishlist/${artworkId}`, method: "DELETE" }),
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } = wishlistApi;