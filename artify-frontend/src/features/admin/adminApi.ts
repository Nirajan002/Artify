import { api } from "../../services/api";
import type { ApiResponse } from "../../services/api";
import type { Paged } from "../artworks/artworksApi";
import type { OrderDetail, OrderStatus, PaymentStatus } from "../orders/ordersApi";

// ---------- Users ----------
export interface AdminUser {
  userId: number; firstName: string; lastName: string; email: string; phoneNumber?: string;
  role: string; isActive: boolean; orderCount: number; createdAt: string;
}

// ---------- Materials / Frames ----------
export interface SaveMaterialRequest { name: string; description?: string; pricePerSquareUnit: number; isActive: boolean }
export interface Material extends SaveMaterialRequest { materialId: number }
export interface SaveFrameRequest { name: string; description?: string; additionalPrice: number; isActive: boolean }
export interface Frame extends SaveFrameRequest { frameId: number }

// ---------- Orders ----------
export interface AdminOrder {
  orderId: number; orderNumber: string; customerName: string; customerEmail: string;
  totalAmount: number; orderStatus: OrderStatus; paymentStatus: PaymentStatus;
  hasCustomPrint: boolean; createdAt: string;
}

// ---------- Dashboard ----------
export interface DashboardStats {
  totalUsers: number; totalArtworks: number; totalOrders: number; totalRevenue: number;
  pendingSubmissions: number; pendingOrders: number; customPrintOrders: number;
}
export interface MonthlyPoint { month: string; revenue: number; orders: number }
export interface PopularArtwork { artworkId: number; title: string; imageUrl: string; unitsSold: number; revenue: number }
export interface CategorySales { category: string; revenue: number; unitsSold: number }
export interface DashboardCharts { monthly: MonthlyPoint[]; popularArtworks: PopularArtwork[]; salesByCategory: CategorySales[] }

export const adminApi = api.injectEndpoints({
  endpoints: (b) => ({
    getAdminUsers: b.query<ApiResponse<Paged<AdminUser>>, { search?: string; role?: string; page?: number }>({
      query: (params) => ({ url: "/admin/users", params: Object.fromEntries(Object.entries(params).filter(([, v]) => v)) }),
      providesTags: (res) => ["AdminUser", ...(res?.data.items ?? []).map((u) => ({ type: "AdminUser" as const, id: u.userId }))],
    }),
    setUserActive: b.mutation<ApiResponse<null>, { id: number; isActive: boolean }>({
      query: ({ id, isActive }) => ({ url: `/admin/users/${id}/active`, method: "PUT", body: isActive }),
      invalidatesTags: ["AdminUser"],
    }),

    getMaterials: b.query<ApiResponse<Material[]>, void>({ query: () => "/admin/materials", providesTags: ["Material"] }),
    createMaterial: b.mutation<ApiResponse<Material>, SaveMaterialRequest>({
      query: (body) => ({ url: "/admin/materials", method: "POST", body }), invalidatesTags: ["Material", "PrintOptions"],
    }),
    updateMaterial: b.mutation<ApiResponse<Material>, { id: number; body: SaveMaterialRequest }>({
      query: ({ id, body }) => ({ url: `/admin/materials/${id}`, method: "PUT", body }), invalidatesTags: ["Material", "PrintOptions"],
    }),
    deleteMaterial: b.mutation<ApiResponse<null>, number>({
      query: (id) => ({ url: `/admin/materials/${id}`, method: "DELETE" }), invalidatesTags: ["Material", "PrintOptions"],
    }),

    getFrames: b.query<ApiResponse<Frame[]>, void>({ query: () => "/admin/frames", providesTags: ["Frame"] }),
    createFrame: b.mutation<ApiResponse<Frame>, SaveFrameRequest>({
      query: (body) => ({ url: "/admin/frames", method: "POST", body }), invalidatesTags: ["Frame", "PrintOptions"],
    }),
    updateFrame: b.mutation<ApiResponse<Frame>, { id: number; body: SaveFrameRequest }>({
      query: ({ id, body }) => ({ url: `/admin/frames/${id}`, method: "PUT", body }), invalidatesTags: ["Frame", "PrintOptions"],
    }),
    deleteFrame: b.mutation<ApiResponse<null>, number>({
      query: (id) => ({ url: `/admin/frames/${id}`, method: "DELETE" }), invalidatesTags: ["Frame", "PrintOptions"],
    }),

    getAdminOrders: b.query<ApiResponse<Paged<AdminOrder>>, { status?: string; search?: string; page?: number }>({
      query: (params) => ({ url: "/admin/orders", params: Object.fromEntries(Object.entries(params).filter(([, v]) => v)) }),
      providesTags: (res) => ["AdminOrder", ...(res?.data.items ?? []).map((o) => ({ type: "AdminOrder" as const, id: o.orderId }))],
    }),
    advanceOrder: b.mutation<ApiResponse<OrderDetail>, { id: number; targetStatus?: OrderStatus }>({
      query: ({ id, targetStatus }) => ({ url: `/admin/orders/${id}/advance`, method: "PUT", body: { targetStatus } }),
      invalidatesTags: (_r, _e, { id }) => ["AdminOrder", { type: "Order", id }, "Dashboard"],
    }),

    getDashboardStats: b.query<ApiResponse<DashboardStats>, void>({ query: () => "/admin/dashboard/stats", providesTags: ["Dashboard"] }),
    getDashboardCharts: b.query<ApiResponse<DashboardCharts>, void>({ query: () => "/admin/dashboard/charts", providesTags: ["Dashboard"] }),
  }),
});

export const {
  useGetAdminUsersQuery, useSetUserActiveMutation,
  useGetMaterialsQuery, useCreateMaterialMutation, useUpdateMaterialMutation, useDeleteMaterialMutation,
  useGetFramesQuery, useCreateFrameMutation, useUpdateFrameMutation, useDeleteFrameMutation,
  useGetAdminOrdersQuery, useAdvanceOrderMutation,
  useGetDashboardStatsQuery, useGetDashboardChartsQuery,
} = adminApi;