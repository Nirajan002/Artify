import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "../app/store";
import { clearToken } from "../features/auth/authSlice";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://localhost:7000";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState & { auth: { token: string | null } })
      .auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra);
  if (result.error?.status === 401) api.dispatch(clearToken());
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "Me",
    "Artwork",
    "Category",
    "Cart",
    "Wishlist",
    "Address",
    "PrintOptions",
    "Order",
    "Review",
    "Submission",
    "AdminUser",
    "Material",
    "Frame",
    "AdminOrder",
    "Dashboard",
  ],
  endpoints: () => ({}),
});
