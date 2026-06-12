"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, clearToken, me, type User } from "./auth";

/** Guard a page: ensures a valid token, returns the user (or null while loading). */
export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.replace("/login");
      return;
    }
    me(t)
      .then((u) => {
        setUser(u);
        setToken(t);
      })
      .catch(() => {
        clearToken();
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    clearToken();
    router.replace("/login");
  }

  return { user, token, loading, logout };
}
