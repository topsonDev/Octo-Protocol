"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, clearToken, me, type User } from "@/lib/auth";
import { Logo } from "@/components/Logo";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    me(token)
      .then(setUser)
      .catch(() => {
        clearToken();
        router.replace("/login");
      });
  }, [router]);

  function logout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-burgundy-soft/30 p-8 text-center">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        {user ? (
          <>
            <h1 className="text-2xl font-semibold text-foreground">
              You&apos;re signed in
            </h1>
            <p className="mt-2 text-sm text-muted">{user.email}</p>
            <p className="mt-1 text-xs text-muted/60">id: {user.id}</p>
            <button
              onClick={logout}
              className="mt-6 rounded-full border border-white/20 px-5 py-2 text-sm text-foreground hover:border-white/40"
            >
              Log out
            </button>
            <p className="mt-6 text-xs text-muted">
              The full dashboard (wallets, addresses, transactions) is next.
            </p>
          </>
        ) : (
          <p className="text-muted">Loading…</p>
        )}
      </div>
    </main>
  );
}
