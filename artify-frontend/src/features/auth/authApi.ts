import { api } from "../../services/api";
import type { ApiResponse } from "../../services/api";
import { setToken, clearToken } from "./authSlice";
import type { Dispatch } from "redux";

export interface User {
  userId: number; firstName: string; lastName: string;
  email: string; phoneNumber?: string; role: "Customer" | "Admin";
}
interface AuthResponse { token: string; expiresAt: string; user: User }
export interface LoginRequest { email: string; password: string }
export interface RegisterRequest {
  firstName: string; lastName: string; email: string; password: string; phoneNumber?: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (b) => ({
    login: b.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setToken(data.data.token));
      },
      invalidatesTags: ["Me", "Cart", "Wishlist"],
    }),
    register: b.mutation<ApiResponse<AuthResponse>, RegisterRequest>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setToken(data.data.token));
      },
      invalidatesTags: ["Me"],
    }),
    getMe: b.query<ApiResponse<User>, void>({
      query: () => "/auth/me",
      providesTags: ["Me"],
    }),
    changePassword: b.mutation<ApiResponse<null>, { currentPassword: string; newPassword: string }>({
      query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
    }),
  }),
});

// Logout = clear token and reset every cached query
export const logout = () => (dispatch: Dispatch) => {
  dispatch(clearToken());
  dispatch(api.util.resetApiState());
};

export const { useLoginMutation, useRegisterMutation, useGetMeQuery, useChangePasswordMutation } = authApi;