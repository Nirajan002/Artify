import { api } from "../../services/api";
import type { ApiResponse } from "../../services/api";

export type ArtworkType =
  | "Painting"
  | "DigitalArt"
  | "Photography"
  | "Illustration"
  | "Sketch"
  | "Abstract"
  | "TraditionalArt";
export type VariantType = "Original" | "Poster" | "Canvas" | "FramedPrint";

export interface Artwork {
  artworkId: number;
  title: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  categorySlug: string;
  artworkType: ArtworkType;
  status: string;
  fromPrice: number;
  averageRating: number;
  reviewCount: number;
  isOriginalAvailable: boolean;
  isPrintAvailable: boolean;
  createdAt: string;
}
export interface Variant {
  artworkVariantId: number;
  variantType: VariantType;
  basePrice: number;
  stockQuantity: number;
  isAvailable: boolean;
}
export interface ArtworkDetail extends Artwork {
  description: string;
  categoryId: number;
  originalPrice: number;
  variants: Variant[];
}
export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
export interface Category {
  categoryId: number;
  name: string;
  slug: string;
  artworkCount: number;
}

export interface ArtworkFilters {
  search?: string;
  category?: string;
  artworkType?: string;
  minPrice?: number;
  maxPrice?: number;
  originalAvailable?: boolean;
  printAvailable?: boolean;
  minRating?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface SaveVariantRequest {
  variantType: VariantType;
  basePrice: number | string;   // string during editing, number on submit
  stockQuantity: number;
  isAvailable: boolean;
}
export interface SaveArtworkRequest {
  title: string;
  description: string;
  categoryId: number;
  imageUrl: string;
  thumbnailUrl?: string;
  artworkType: ArtworkType;
  originalPrice: number;
  isOriginalAvailable: boolean;
  isPrintAvailable: boolean;
  status: string;
  variants: SaveVariantRequest[];
}

export interface HomeReview {
  reviewerName: string;
  rating: number;
  comment?: string;
  artworkTitle: string;
}
export interface HomeData {
  featured: Artwork[];
  popular: Artwork[];
  newArrivals: Artwork[];
  categories: Category[];
  testimonials: HomeReview[];
}

// RTK Query keeps undefined values out, but empty strings would still be sent
const clean = (f: ArtworkFilters) =>
  Object.fromEntries(
    Object.entries(f).filter(
      ([, v]) => v !== undefined && v !== "" && v !== false,
    ),
  );

export const artworksApi = api.injectEndpoints({
  endpoints: (b) => ({
    getArtworks: b.query<ApiResponse<Paged<Artwork>>, ArtworkFilters>({
      query: (filters) => ({ url: "/artworks", params: clean(filters) }),
      providesTags: (res) => [
        "Artwork",
        ...(res?.data.items ?? []).map((a) => ({
          type: "Artwork" as const,
          id: a.artworkId,
        })),
      ],
    }),
    getArtwork: b.query<ApiResponse<ArtworkDetail>, number>({
      query: (id) => `/artworks/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Artwork", id }],
    }),
    getCategories: b.query<ApiResponse<Category[]>, void>({
      query: () => "/categories",
      providesTags: ["Category"],
    }),

    getAdminArtworks: b.query<ApiResponse<Paged<Artwork>>, ArtworkFilters>({
      query: (filters) => ({ url: "/admin/artworks", params: clean(filters) }),
      providesTags: (res) => [
        "Artwork",
        ...(res?.data.items ?? []).map((a) => ({
          type: "Artwork" as const,
          id: a.artworkId,
        })),
      ],
    }),
    getAdminArtwork: b.query<ApiResponse<ArtworkDetail>, number>({
      query: (id) => `/admin/artworks/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Artwork", id }],
    }),
    uploadArtworkImage: b.mutation<ApiResponse<string>, File>({
      query: (file) => {
        const body = new FormData();
        body.append("file", file);
        return { url: "/admin/artworks/upload", method: "POST", body };
      },
    }),
    createArtwork: b.mutation<ApiResponse<ArtworkDetail>, SaveArtworkRequest>({
      query: (body) => ({ url: "/admin/artworks", method: "POST", body }),
      invalidatesTags: ["Artwork", "Category"],
    }),
    updateArtwork: b.mutation<
      ApiResponse<ArtworkDetail>,
      { id: number; body: SaveArtworkRequest }
    >({
      query: ({ id, body }) => ({
        url: `/admin/artworks/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Artwork", id },
        "Artwork",
        "Category",
      ],
    }),
    archiveArtwork: b.mutation<ApiResponse<null>, number>({
      query: (id) => ({ url: `/admin/artworks/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Artwork", id }, "Artwork"],
    }),

    getHomeData: b.query<ApiResponse<HomeData>, void>({
      query: () => "/home",
      providesTags: ["Artwork", "Category"],
    }),
  }),
});

export const {
  useGetArtworksQuery,
  useGetArtworkQuery,
  useGetCategoriesQuery,
  useGetAdminArtworksQuery,
  useGetAdminArtworkQuery,
  useUploadArtworkImageMutation,
  useCreateArtworkMutation,
  useUpdateArtworkMutation,
  useArchiveArtworkMutation,
  useGetHomeDataQuery,
} = artworksApi;
