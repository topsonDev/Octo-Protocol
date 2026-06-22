"use client";

import { useEffect, useState } from "react";
import {
  listSponsoredTransactions,
  type SponsoredTransaction,
} from "@/lib/sponsorship";
import { stroopsToAmount } from "@/lib/wallets";

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-400",
  failed: "bg-red-500/15 text-red-400",
  pending: "bg-amber-500/15 text-amber-400",
};

export function SponsoredTransactionsTable({
  walletId,
  token,
}: {
  walletId: string;
  token: string;
}) {
  const [rows, setRows] = useState<SponsoredTransaction[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let active = true;
    listSponsoredTransactions(walletId, token)
      .then((page) => {
        if (!active) return;
        setRows(page.data);
        setCursor(page.next_cursor);
      })
      .catch(() => active && setRows([]));
    return () => {
      active = false;
    };
  }, [walletId, token]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await listSponsoredTransactions(walletId, token, cursor);
      // Append — never replace the existing rows.
      setRows((prev) => [...(prev ?? []), ...page.data]);
      setCursor(page.next_cursor);
    } catch {
      // leave the existing list in place on failure
    } finally {
      setLoadingMore(false);
    }
  }

  // Summary: count + total fees for the current calendar month (from loaded rows).
  const now = new Date();
  const monthRows = (rows ?? []).filter((r) => {
    const d = new Date(r.created_at);
    return (
      d.getUTCFullYear() === now.getUTCFullYear() &&
      d.getUTCMonth() === now.getUTCMonth()
    );
  });
  const monthFeeStroops = monthRows.reduce((sum, r) => sum + r.fee_stroops, 0);

  return (
    <section className="rounded-2xl border border-white/10 bg-burgundy-soft/30 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">
          Sponsored transactions
        </h2>
        <p className="text-xs text-muted">
          {monthRows.length}{" "}
          {monthRows.length === 1 ? "transaction" : "transactions"} sponsored ·{" "}
          {stroopsToAmount(monthFeeStroops)} XLM total fees this month
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Inner Tx Hash</th>
              <th className="py-2 pr-4">Fee Bump Tx Hash</th>
              <th className="py-2 pr-4">Fee</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows === null ? (
              <EmptyRow>Loading…</EmptyRow>
            ) : rows.length === 0 ? (
              <EmptyRow>
                No sponsored transactions yet. Use the{" "}
                <code className="text-foreground">/sponsor</code> endpoint in
                your integration to get started.
              </EmptyRow>
            ) : (
              rows.map((tx) => (
                <tr key={tx.id} className="text-foreground/90">
                  <td className="py-3 pr-4 text-xs text-muted whitespace-nowrap">
                    {formatDate(tx.created_at)}
                  </td>
                  <td className="py-3 pr-4">
                    <HashCell hash={tx.inner_tx_hash} />
                  </td>
                  <td className="py-3 pr-4">
                    <HashCell hash={tx.fee_bump_tx_hash} />
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    {stroopsToAmount(tx.fee_stroops)} XLM
                  </td>
                  <td className="py-3">
                    <StatusBadge status={tx.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {cursor && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-foreground transition-colors hover:border-burgundy/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </section>
  );
}

function HashCell({ hash }: { hash: string | null }) {
  const [copied, setCopied] = useState(false);

  if (!hash) return <span className="text-muted">—</span>;

  return (
    <span className="flex items-center gap-2">
      <span className="font-mono text-xs text-foreground">
        {`${hash.slice(0, 6)}…${hash.slice(-6)}`}
      </span>
      <button
        onClick={() => {
          // Always copy the full hash, not the truncated display value.
          navigator.clipboard.writeText(hash);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="text-muted hover:text-foreground"
        title="Copy full hash"
        aria-label="Copy full transaction hash"
      >
        {copied ? "✓" : "⧉"}
      </button>
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status] ?? "bg-white/10 text-muted";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${cls}`}
    >
      {status}
    </span>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={5} className="py-10 text-center text-sm text-muted">
        {children}
      </td>
    </tr>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  return `${date} · ${time} UTC`;
}
