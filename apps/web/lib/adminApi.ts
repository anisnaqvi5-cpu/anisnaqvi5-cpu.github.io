"use client";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Request failed");
  return data as T;
}

export const adminApi = {
  session: () => request<{ authed: boolean }>("/api/admin/session"),
  login: (passcode: string) => request<{ ok: true }>("/api/admin/login", { method: "POST", body: JSON.stringify({ passcode }) }),
  logout: () => request<{ ok: true }>("/api/admin/logout", { method: "POST" }),

  listOrders: (status?: string) =>
    request<{ orders: import("@/lib/ecommerce/types").OrderRecord[] }>(`/api/admin/orders${status ? `?status=${status}` : ""}`),

  getOrder: (id: string) =>
    request<{ order: import("@/lib/ecommerce/types").OrderRecord; items: import("@/lib/ecommerce/types").OrderItemRecord[] }>(`/api/admin/orders/${id}`),

  updateStatus: (id: string, body: { status: string; note?: string; trackingNumber?: string; carrier?: string }) =>
    request<{ order: import("@/lib/ecommerce/types").OrderRecord }>(`/api/admin/orders/${id}/status`, { method: "POST", body: JSON.stringify(body) }),

  refund: (id: string) => request<{ order: import("@/lib/ecommerce/types").OrderRecord }>(`/api/admin/orders/${id}/refund`, { method: "POST" }),

  listReturns: () => request<{ returns: import("@/lib/ecommerce/types").ReturnRequest[] }>("/api/admin/returns"),

  resolveReturn: (id: string, action: "approve" | "reject") =>
    request<{ ok: true }>(`/api/admin/returns/${id}`, { method: "POST", body: JSON.stringify({ action }) }),
};
