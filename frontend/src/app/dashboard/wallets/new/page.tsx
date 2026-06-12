"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { createWallet, type CreateWalletResponse } from "@/lib/wallets";
import { ApiError } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function NewWalletPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreateWalletResponse | null>(null);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Loading…
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSubmitting(true);
    try {
      const wallet = await createWallet(token, name, description);
      setCreated(wallet); // show the one-time recovery mnemonic
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to create wallet.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardShell email={user.email} title="New master wallet" onLogout={logout}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted">
          <Link href="/dashboard" className="hover:text-foreground">
            My Wallets
          </Link>
          <span>›</span>
          <span className="text-foreground">New master wallet</span>
        </div>

        {created ? (
          <RecoveryReveal
            wallet={created}
            onDone={() => router.push("/dashboard")}
          />
        ) : (
          <div className="grid gap-12 lg:grid-cols-2">
            {/* left: explainer */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Create a new master wallet
              </h2>
              <p className="mt-3 max-w-sm text-sm text-muted">
                Your master wallet will be created on Stellar. You&apos;ll be
                able to receive deposits and generate dedicated addresses for
                your customers.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {["Receive deposits", "Generate addresses", "Withdraw funds"].map(
                  (f) => (
                    <li key={f} className="flex items-center gap-2 text-foreground">
                      <span className="text-burgundy-bright">✓</span> {f}
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* right: form */}
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Blockchain network
                </label>
                <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-burgundy-bright" />
                    Stellar — Testnet
                  </span>
                  <span className="text-xs text-muted">fixed</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Assets <span className="text-muted">(Optional)</span>
                </label>
                <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">XLM (native)</span>
                    <span className="text-xs text-muted">
                      enabled by default
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Wallet name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme master wallet"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-burgundy-bright focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Wallet description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this wallet for?"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-burgundy-bright focus:outline-none"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-burgundy/40 bg-burgundy/10 px-3 py-2 text-sm text-burgundy-bright">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-burgundy py-3 text-sm font-semibold text-white transition-colors hover:bg-burgundy-bright disabled:opacity-60"
              >
                {submitting ? "Creating…" : "Continue"}
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function RecoveryReveal({
  wallet,
  onDone,
}: {
  wallet: CreateWalletResponse;
  onDone: () => void;
}) {
  const [acked, setAcked] = useState(false);
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-burgundy/40 bg-burgundy-soft/30 p-8">
      <h2 className="text-xl font-semibold text-foreground">
        Wallet created — save your recovery phrase
      </h2>
      <p className="mt-2 text-sm text-muted">
        This 12-word phrase is shown <strong>once</strong>. It can recover your
        funds. Store it somewhere safe and never share it.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-black/40 p-4">
        {wallet.recovery_mnemonic.split(" ").map((word, i) => (
          <span
            key={i}
            className="rounded-md bg-white/5 px-2 py-1.5 text-center text-sm text-foreground"
          >
            <span className="mr-1 text-muted">{i + 1}.</span>
            {word}
          </span>
        ))}
      </div>

      <div className="mt-5 rounded-lg bg-black/30 p-3 text-xs">
        <p className="text-muted">Address</p>
        <p className="mt-1 break-all font-mono text-foreground">
          {wallet.address}
        </p>
        <p className="mt-2 text-burgundy-bright">
          {wallet.funded ? "✓ Funded on testnet" : "Not yet funded"}
        </p>
      </div>

      <label className="mt-5 flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={acked}
          onChange={(e) => setAcked(e.target.checked)}
          className="accent-[var(--burgundy-bright)]"
        />
        I have securely saved my recovery phrase
      </label>

      <button
        onClick={onDone}
        disabled={!acked}
        className="mt-5 w-full rounded-xl bg-burgundy py-3 text-sm font-semibold text-white transition-colors hover:bg-burgundy-bright disabled:opacity-50"
      >
        Go to dashboard
      </button>
    </div>
  );
}
