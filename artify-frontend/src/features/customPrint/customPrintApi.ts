import { api } from "../../services/api";
import type { ApiResponse } from "../../services/api";

export interface PrintMaterial { materialId: number; name: string; description?: string; pricePerSquareUnit: number }
export interface PrintFrame { frameId: number; name: string; description?: string; additionalPrice: number }
export interface PrintOptions {
  limits: { minSide: number; maxSide: number; unit: string };
  sizes: { width: number; height: number }[];
  materials: PrintMaterial[];
  frames: PrintFrame[];
}
export interface PrintPriceRequest { width: number; height: number; materialId: number; frameId: number; quantity: number }
export interface PrintPrice {
  width: number; height: number; area: number;
  baseCost: number; sizeCost: number; materialCost: number; frameCost: number;
  unitPrice: number; quantity: number; total: number;
}

export const customPrintApi = api.injectEndpoints({
  endpoints: (b) => ({
    getPrintOptions: b.query<ApiResponse<PrintOptions>, void>({
      query: () => "/custom-print/options",
      providesTags: ["PrintOptions"],
    }),
    // A POST that only reads: modelled as a query so results are cached per configuration
    calculatePrice: b.query<ApiResponse<PrintPrice>, PrintPriceRequest>({
      query: (body) => ({ url: "/custom-print/calculate-price", method: "POST", body }),
      providesTags: ["PrintOptions"],   // refetch automatically when admins change prices (Phase 9)
    }),
    uploadCustomArt: b.mutation<ApiResponse<string>, File>({
      query: (file) => {
        const body = new FormData();
        body.append("file", file);
        return { url: "/custom-print/upload", method: "POST", body };
      },
    }),
  }),
});

export const { useGetPrintOptionsQuery, useCalculatePriceQuery, useUploadCustomArtMutation } = customPrintApi;