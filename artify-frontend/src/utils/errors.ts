import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface ApiErrorBody { message?: string; errors?: Record<string, string[]> }

const bodyOf = (e: unknown): ApiErrorBody | undefined => {
  const err = e as FetchBaseQueryError;
  return err && typeof err === "object" && "data" in err ? (err.data as ApiErrorBody) : undefined;
};

export function getErrorMessage(e: unknown, fallback = "Something went wrong. Please try again.") {
  if ((e as FetchBaseQueryError)?.status === "FETCH_ERROR") return "Cannot reach the server.";
  return bodyOf(e)?.message ?? fallback;
}

/** { title: ["Title is required"] } -> { title: "Title is required" } */
export function getFieldErrors(e: unknown): Record<string, string> {
  const errors = bodyOf(e)?.errors ?? {};
  return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]]));
}