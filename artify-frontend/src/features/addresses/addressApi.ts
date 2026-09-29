import { api } from "../../services/api";
import type { ApiResponse } from "../../services/api";

export interface SaveAddressRequest {
  fullName: string; phoneNumber: string; addressLine1: string; addressLine2?: string;
  city: string; state: string; postalCode: string; country: string; isDefault: boolean;
}
export interface Address extends SaveAddressRequest { addressId: number }

export const addressApi = api.injectEndpoints({
  endpoints: (b) => ({
    getAddresses: b.query<ApiResponse<Address[]>, void>({
      query: () => "/addresses",
      providesTags: ["Address"],
    }),
    createAddress: b.mutation<ApiResponse<Address>, SaveAddressRequest>({
      query: (body) => ({ url: "/addresses", method: "POST", body }),
      invalidatesTags: ["Address"],
    }),
    updateAddress: b.mutation<ApiResponse<Address>, { id: number; body: SaveAddressRequest }>({
      query: ({ id, body }) => ({ url: `/addresses/${id}`, method: "PUT", body }),
      invalidatesTags: ["Address"],
    }),
    setDefaultAddress: b.mutation<ApiResponse<null>, number>({
      query: (id) => ({ url: `/addresses/${id}/default`, method: "PUT" }),
      invalidatesTags: ["Address"],
    }),
    deleteAddress: b.mutation<ApiResponse<null>, number>({
      query: (id) => ({ url: `/addresses/${id}`, method: "DELETE" }),
      invalidatesTags: ["Address"],
    }),
  }),
});

export const {
  useGetAddressesQuery, useCreateAddressMutation, useUpdateAddressMutation,
  useSetDefaultAddressMutation, useDeleteAddressMutation,
} = addressApi;