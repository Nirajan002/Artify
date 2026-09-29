import { api } from "../../services/api";
import type { ApiResponse } from "../../services/api";
import type { Paged } from "../artworks/artworksApi";

export type OrderStatus =
  | "Pending" | "Confirmed" | "Processing" | "Printing" | "Framing" | "Shipped" | "Delivered" | "Cancelled";
export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";
export type PaymentMethodType = "CashOnDelivery" | "MockOnline";

export interface OrderListItem {
  orderId: number; orderNumber: string; totalAmount: number;
  orderStatus: OrderStatus; paymentStatus: PaymentStatus;
  itemCount: number; thumbnailUrl: string; createdAt: string;
}
export interface OrderItem {
  orderItemId: number; itemType: "Artwork" | "CustomPrint"; artworkId?: number;
  title: string; imageUrl: string; variantType?: string;
  quantity: number; unitPrice: number; totalPrice: number;
  customWidth?: number; customHeight?: number; materialName?: string; frameName?: string;
}
export interface OrderDetail extends OrderListItem {
  shippingAddress: string; subtotal: number; shippingFee: number; discount: number;
  paymentMethod: PaymentMethodType; items: OrderItem[]; statusFlow: OrderStatus[]; canCancel: boolean;
}
export interface CreateOrderRequest { addressId: number; paymentMethod: PaymentMethodType }

export const ordersApi = api.injectEndpoints({
  endpoints: (b) => ({
    createOrder: b.mutation<ApiResponse<OrderDetail>, CreateOrderRequest>({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: ["Order", "Cart", "Artwork"],   // stock changed, so artwork pages may change too
    }),
    getOrders: b.query<ApiResponse<Paged<OrderListItem>>, { status?: OrderStatus; page?: number; pageSize?: number }>({
      query: (params) => ({
        url: "/orders",
        params: Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)),
      }),
      providesTags: (res) => [
        "Order",
        ...(res?.data.items ?? []).map((o) => ({ type: "Order" as const, id: o.orderId })),
      ],
    }),
    getOrder: b.query<ApiResponse<OrderDetail>, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Order", id }],
    }),
    cancelOrder: b.mutation<ApiResponse<OrderDetail>, number>({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Order", id }, "Order", "Artwork"],
    }),
  }),
});

export const { useCreateOrderMutation, useGetOrdersQuery, useGetOrderQuery, useCancelOrderMutation } = ordersApi;