import { ApiError, type ApiResponse } from "./types";

const API_URL = import.meta.env.VITE_API_URL;

const request = async <T>(
  path: string,
  options: RequestInit = {},
  initData?: string
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
      ...(initData ? { "x-telegram-init-data": initData } : {})
    }
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: "Unknown" }));
    throw new ApiError(errorBody.error || "API Error", response.status);
  }
  return response.json();
};

export const api = {
  profile: (initData: string) => request<ApiResponse>("/profile", {}, initData),
  generateTask: (payload: unknown, initData: string) =>
    request<ApiResponse>("/generateTask", {
      method: "POST",
      body: JSON.stringify(payload)
    }, initData),
  submitAnswer: (payload: unknown, initData: string) =>
    request<ApiResponse>("/submitAnswer", {
      method: "POST",
      body: JSON.stringify(payload)
    }, initData),
  history: (initData: string) => request<ApiResponse>("/history", {}, initData),
  updateSettings: (payload: unknown, initData: string) =>
    request<ApiResponse>("/settings", {
      method: "PUT",
      body: JSON.stringify(payload)
    }, initData),
  resetProgress: (initData: string) =>
    request<ApiResponse>("/settings/reset", { method: "POST" }, initData),
  ads: (initData: string) => request<ApiResponse>("/ads", {}, initData),
  createPayment: (payload: unknown, initData: string) =>
    request<ApiResponse>("/payments/create", {
      method: "POST",
      body: JSON.stringify(payload)
    }, initData),
  adminUsers: (initData: string) => request<ApiResponse>("/admin/users", {}, initData),
  adminAds: (initData: string) => request<ApiResponse>("/admin/ads", {}, initData),
  adminCreateAd: (payload: unknown, initData: string) =>
    request<ApiResponse>("/admin/ads", {
      method: "POST",
      body: JSON.stringify(payload)
    }, initData),
  adminUpdateAd: (id: string, payload: unknown, initData: string) =>
    request<ApiResponse>(`/admin/ads/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }, initData),
  adminDeleteAd: (id: string, initData: string) =>
    request<ApiResponse>(`/admin/ads/${id}`, { method: "DELETE" }, initData),
  adminVip: (payload: unknown, initData: string) =>
    request<ApiResponse>("/admin/vip", {
      method: "POST",
      body: JSON.stringify(payload)
    }, initData),
  adminVipRevoke: (payload: unknown, initData: string) =>
    request<ApiResponse>("/admin/vip/revoke", {
      method: "POST",
      body: JSON.stringify(payload)
    }, initData),
  adminMonetization: (payload: unknown, initData: string) =>
    request<ApiResponse>("/admin/monetization", {
      method: "POST",
      body: JSON.stringify(payload)
    }, initData),
  adminAiLogs: (initData: string) => request<ApiResponse>("/admin/ai-logs", {}, initData)
};
