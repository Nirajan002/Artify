import { API_BASE_URL } from "../services/api";

const BACKEND_ORIGIN = /^https?:\/\/artify-2\.runasp\.net/i;

export const imageUrl = (url?: string | null) => {
  if (!url) return "";
  const path = url.replace(BACKEND_ORIGIN, "");
  return path.startsWith("/") ? `${API_BASE_URL}${path}` : path;
};

export const formatPrice = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;