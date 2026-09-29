import { api } from "../../services/api";
import type { ApiResponse } from "../../services/api";
import type { ArtworkType, Paged } from "../artworks/artworksApi";

export type SubmissionStatus = "Pending" | "Approved" | "Rejected";

export interface CreateSubmissionRequest {
  submitterName: string; email: string; phoneNumber: string;
  title: string; description: string; categoryId: number;
  artworkType: ArtworkType; originalPrice: number;
  imageUrl: string; additionalInformation?: string;
}
export interface SubmissionListItem {
  submissionId: number; title: string; submitterName: string; email: string;
  imageUrl: string; category: string; originalPrice: number;
  status: SubmissionStatus; submittedAt: string;
}
export interface SubmissionDetail extends SubmissionListItem {
  phoneNumber: string; description: string; categoryId: number; artworkType: ArtworkType;
  additionalInformation?: string; adminComment?: string; reviewedAt?: string; artworkId?: number;
}
export interface SubmissionFilters { status?: SubmissionStatus; search?: string; page?: number; pageSize?: number }

const LIST = { type: "Submission" as const, id: "LIST" };

export const submissionsApi = api.injectEndpoints({
  endpoints: (b) => ({
    uploadSubmissionImage: b.mutation<ApiResponse<string>, File>({
      query: (file) => {
        const body = new FormData();
        body.append("file", file);
        return { url: "/artwork-submissions/upload", method: "POST", body };
      },
    }),
    createSubmission: b.mutation<ApiResponse<{ submissionId: number; status: string }>, CreateSubmissionRequest>({
      query: (body) => ({ url: "/artwork-submissions", method: "POST", body }),
      invalidatesTags: [LIST],
    }),

    // ---- admin ----
    getSubmissions: b.query<ApiResponse<Paged<SubmissionListItem>>, SubmissionFilters>({
      query: (params) => ({
        url: "/admin/artwork-submissions",
        params: Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "")),
      }),
      providesTags: (res) => [
        LIST,
        ...(res?.data.items ?? []).map((s) => ({ type: "Submission" as const, id: s.submissionId })),
      ],
    }),
    getSubmission: b.query<ApiResponse<SubmissionDetail>, number>({
      query: (id) => `/admin/artwork-submissions/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Submission", id }],
    }),
    approveSubmission: b.mutation<ApiResponse<SubmissionDetail>, { id: number; comment?: string }>({
      query: ({ id, comment }) => ({ url: `/admin/artwork-submissions/${id}/approve`, method: "PUT", body: { comment } }),
      // the new artwork must show up in the shop, and category counts change
      invalidatesTags: (_r, _e, { id }) => [{ type: "Submission", id }, LIST, "Artwork", "Category"],
    }),
    rejectSubmission: b.mutation<ApiResponse<SubmissionDetail>, { id: number; reason: string }>({
      query: ({ id, reason }) => ({ url: `/admin/artwork-submissions/${id}/reject`, method: "PUT", body: { reason } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Submission", id }, LIST],
    }),
  }),
});

export const {
  useUploadSubmissionImageMutation, useCreateSubmissionMutation,
  useGetSubmissionsQuery, useGetSubmissionQuery,
  useApproveSubmissionMutation, useRejectSubmissionMutation,
} = submissionsApi;