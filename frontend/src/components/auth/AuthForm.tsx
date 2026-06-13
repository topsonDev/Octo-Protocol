"use client";

import { useState } from "react";
import Link from "next/link";
import { signup, login, saveToken } from "@/lib/auth";
import { ApiError } from "@/lib/api";

type Mode = "signup" | "login";

export function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === "signup";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = isSignup
        ? await signup(email, password)
        : await login(email, password);
      saveToken(result.token);
      // Hard navigation so the dashboard mounts fresh with the token already in
      // localStorage (avoids a client-router race that can bounce back to /login).
      window.location.assign("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-center text-3xl font-semibold text-foreground">
        {isSignup ? "Create a new account" : "Welcome back"}
      </h1>
      <p className="mt-3 text-center text-sm text-muted">
        {isSignup
          ? "Set up your account to start processing stablecoin deposits and payments"
          : "Sign in to your Octo dashboard"}
      </p>

      <div className="my-7 h-px bg-white/10" />

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground">
            Email Address
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 focus-within:border-burgundy-bright">
            <span className="text-muted">✉</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter personal email here"
              autoComplete="email"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Password</label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 focus-within:border-burgundy-bright">
            <span className="text-muted"></span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? "Create a password (8+ chars)" : "Enter your password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-burgundy/40 bg-burgundy/10 px-3 py-2 text-sm text-burgundy-bright">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-burgundy py-3 text-sm font-semibold text-white transition-colors hover:bg-burgundy-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Please wait…" : isSignup ? "Continue" : "Sign in"}
        </button>
      </form>

      <div className="my-7 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-muted">OR</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <p className="text-center text-sm text-muted">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-foreground hover:text-burgundy-bright">
              Login here
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-foreground hover:text-burgundy-bright">
              Sign up here
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
