import { api } from "../../services/api";
import type { ApiResponse } from "../../services/api";
import type { VariantType } from "../artworks/artworksApi";

export interface CartItem {
  cartItemId: number; itemType: "Artwork" | "CustomPrint";
  artworkId?: number; artworkVariantId?: number; variantType?: VariantType;
  title: string; imageUrl: string; quantity: number; unitPrice: number; lineTotal: number;
  issue?: string | null; customWidth?: number; customHeight?: number;
}

export interface AddToCartRequest {
  itemType: "Artwork" | "CustomPrint";
  artworkVariantId?: number;
  quantity: number;
  // custom print
  customArtworkUrl?: string; customWidth?: number; customHeight?: number;
  materialId?: number; frameId?: number;
}

export interface Cart { items: CartItem[]; itemCount: number; subtotal: number; hasIssues: boolean }

export interface AddToCartRequest {
  itemType: "Artwork" | "CustomPrint";
  artworkVariantId?: number; quantity: number;
}

export const cartApi = api.injectEndpoints({
  endpoints: (b) => ({
    getCart: b.query<ApiResponse<Cart>, void>({
      query: () => "/cart",
      providesTags: ["Cart"],
    }),
    addToCart: b.mutation<ApiResponse<Cart>, AddToCartRequest>({
      query: (body) => ({ url: "/cart/items", method: "POST", body }),
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: b.mutation<ApiResponse<Cart>, { id: number; quantity: number }>({
      query: ({ id, quantity }) => ({ url: `/cart/items/${id}`, method: "PUT", body: { quantity } }),
      invalidatesTags: ["Cart"],
    }),
    removeCartItem: b.mutation<ApiResponse<Cart>, number>({
      query: (id) => ({ url: `/cart/items/${id}`, method: "DELETE" }),
      invalidatesTags: ["Cart"],
    }),
    clearCart: b.mutation<ApiResponse<Cart>, void>({
      query: () => ({ url: "/cart", method: "DELETE" }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery, useAddToCartMutation, useUpdateCartItemMutation,
  useRemoveCartItemMutation, useClearCartMutation,
} = cartApi;