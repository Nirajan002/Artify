import { API_BASE_URL } from "../services/api";

export const imageUrl = (url?: string | null) =>
  !url ? "" : url.startsWith("/") ? `${API_BASE_URL}${url}` : url;

export const formatPrice = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;