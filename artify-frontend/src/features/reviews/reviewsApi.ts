import { api, type ApiResponse } from "../../services/api";

export interface Review {
  reviewId: number; userId: number; reviewerName: string;
  rating: number; comment?: string; createdAt: string; updatedAt?: string; isOwn: boolean;
}
export interface ReviewSummary {
  averageRating: number; reviewCount: number; breakdown: Record<number, number>; reviews: Review[];
}
export interface EligibleOrder { orderId: number; orderNumber: string; deliveredOrPlacedAt: string }
export interface ReviewEligibility {
  canReview: boolean; alreadyReviewed: boolean; existingReviewId?: number;
  rating?: number; comment?: string; reason?: string; eligibleOrders: EligibleOrder[];
}
export interface SaveReviewRequest { orderId: number; rating: number; comment?: string }

export const reviewsApi = api.injectEndpoints({
  endpoints: (b) => ({
    getReviews: b.query<ApiResponse<ReviewSummary>, number>({
      query: (artworkId) => `/artworks/${artworkId}/reviews`,
      providesTags: (_r, _e, artworkId) => [{ type: "Review", id: artworkId }],
    }),
    getReviewEligibility: b.query<ApiResponse<ReviewEligibility>, number>({
      query: (artworkId) => `/artworks/${artworkId}/reviews/eligibility`,
      providesTags: (_r, _e, artworkId) => [{ type: "Review", id: `eligibility-${artworkId}` }],
    }),
    createReview: b.mutation<ApiResponse<Review>, { artworkId: number; body: SaveReviewRequest }>({
      query: ({ artworkId, body }) => ({ url: `/artworks/${artworkId}/reviews`, method: "POST", body }),
      invalidatesTags: (_r, _e, { artworkId }) =>
        [{ type: "Review", id: artworkId }, { type: "Review", id: `eligibility-${artworkId}` }, { type: "Artwork", id: artworkId }],
    }),
    updateReview: b.mutation<ApiResponse<Review>, { artworkId: number; reviewId: number; body: SaveReviewRequest }>({
      query: ({ reviewId, body }) => ({ url: `/reviews/${reviewId}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { artworkId }) =>
        [{ type: "Review", id: artworkId }, { type: "Review", id: `eligibility-${artworkId}` }, { type: "Artwork", id: artworkId }],
    }),
    deleteReview: b.mutation<ApiResponse<null>, { artworkId: number; reviewId: number }>({
      query: ({ reviewId }) => ({ url: `/reviews/${reviewId}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { artworkId }) =>
        [{ type: "Review", id: artworkId }, { type: "Review", id: `eligibility-${artworkId}` }, { type: "Artwork", id: artworkId }],
    }),
  }),
});

export const {
  useGetReviewsQuery, useGetReviewEligibilityQuery,
  useCreateReviewMutation, useUpdateReviewMutation, useDeleteReviewMutation,
} = reviewsApi;