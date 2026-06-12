/** Auth helpers: signup/login API calls + client-side token storage. */

"use client";

import { apiFetch } from "./api";

const TOKEN_KEY = "octo_token";

export type User = { id: string; email: string };
export type AuthResult = { token: string; user: User };

export async function signup(email: string, password: string): Promise<AuthResult> {
  return apiFetch<AuthResult>("/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string): Promise<AuthResult> {
  return apiFetch<AuthResult>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function me(token: string): Promise<User> {
  return apiFetch<User>("/v1/auth/me", { token });
}

// --- token storage (localStorage; bearer-token auth, not cookies) ---

export function saveToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}
