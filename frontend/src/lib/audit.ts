"use client";

import { apiFetch } from "./api";

export type AuditLog = {
  id: string;
  action: string;
  category: string;
  target: string | null;
  ip_address: string | null;
  created_at: string;
};

/** List the authenticated user's audit logs, optionally filtered. */
export function listAuditLogs(
  token: string,
  opts: { category?: string; search?: string } = {},
) {
  const params = new URLSearchParams();
  if (opts.category && opts.category !== "all") params.set("category", opts.category);
  if (opts.search) params.set("search", opts.search);
  const qs = params.toString();
  return apiFetch<AuditLog[]>(`/v1/audit-logs${qs ? `?${qs}` : ""}`, { token });
}
