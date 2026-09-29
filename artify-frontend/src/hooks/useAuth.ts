import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { useGetMeQuery } from "../features/auth/authApi";

export function useAuth() {
  const token = useSelector((s: RootState) => (s.auth as { token: string | null }).token);
  const { data, isLoading } = useGetMeQuery(undefined, { skip: !token });
  const user = token ? (data?.data ?? null) : null;

  return {
    user,
    isLoading: !!token && isLoading && !user,
    isAuthenticated: !!token,   // <-- was `!!user`; now instant on logout
    isAdmin: user?.role === "Admin",
  };
}