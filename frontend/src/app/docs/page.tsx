import Link from "next/link";
import { Prose, Callout } from "@/components/docs/DocsUI";

export default function DocsIntro() {
  return (
    <Prose>
      <p className="text-xs font-semibold uppercase tracking-wide text-burgundy-bright">
        Introduction
      </p>
      <h1 className="mt-2 text-4xl font-semibold text-foreground">Why Octo</h1>

      <p>
        Octo is <strong>Wallet-as-a-Service for stablecoins on Stellar</strong>.
        It gives your product a single master wallet per network from which you
        can generate a dedicated deposit address for every customer, detect
        deposits in real time, and initiate withdrawals — all from one REST API,
        with signed webhooks and a non-custodial key model.
      </p>

      <p>
        You never touch private keys or run blockchain infrastructure. You call
        the Octo API with your <strong>Wallet ID</strong> and{" "}
        <strong>API key</strong>, and react to webhooks. Octo handles
        derivation, signing, deposit attribution, and settlement.
      </p>

      <h2>Dedicated addresses, the Stellar way</h2>
      <p>
        Instead of deploying a funded on-chain account per customer (and
        sweeping funds back), Octo uses <strong>muxed accounts</strong> (
        <code>M…</code>): one real account (<code>G…</code>) plus a per-customer
        64-bit id encoded into the address. Deposits to a customer&apos;s{" "}
        <code>M…</code> land directly in your master wallet and carry the id, so:
      </p>
      <ul>
        <li>
          <strong>no auto-sweep</strong> — funds are already in the master
          wallet;
        </li>
        <li>
          <strong>no per-customer reserve</strong> — only one account exists
          on-chain;
        </li>
        <li>
          <strong>addresses are free and instant</strong> — generating one is an
          off-chain operation.
        </li>
      </ul>

      <Callout type="tip">
        For senders that don&apos;t support muxed addresses (some exchanges),
        every Octo address also exposes a <code>G…</code> + numeric{" "}
        <code>memo_id</code> fallback that resolves to the same customer.
      </Callout>

      <h2>What you can build</h2>
      <ul>
        <li>Stablecoin checkout with per-customer deposit addresses</li>
        <li>Cross-border payouts and treasury from one master wallet</li>
        <li>Real-time deposit notifications via signed webhooks</li>
      </ul>

      <h2>Next steps</h2>
      <p>
        Head to{" "}
        <Link href="/docs/getting-started">From 0 to integration</Link> for the
        end-to-end walkthrough, or jump to the{" "}
        <Link href="/docs/api">API Reference</Link>.
      </p>
    </Prose>
  );
}
