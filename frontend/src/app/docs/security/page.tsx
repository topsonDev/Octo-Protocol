import { Prose, Callout } from "@/components/docs/DocsUI";

export default function Security() {
  return (
    <Prose>
      <p className="text-xs font-semibold uppercase tracking-wide text-burgundy-bright">
        Essentials
      </p>
      <h1 className="mt-2 text-4xl font-semibold text-foreground">Security</h1>
      <p>
        Octo is custody-adjacent software. The design centers on one rule: the
        HD seed is encrypted at rest and only ever decrypted in memory, inside a
        single component, for the instant it takes to sign — then wiped.
      </p>

      <h2>Key management</h2>
      <ul>
        <li>
          One HD seed per network, stored <strong>AES-256-GCM encrypted</strong>{" "}
          with a random nonce and salt. The master key comes from a secret
          manager, never the database.
        </li>
        <li>
          Private keys are <strong>derived on demand</strong> (SEP-0005) and
          never persisted. The seed is <strong>zeroized</strong> immediately
          after signing and never written to logs.
        </li>
        <li>
          The recovery phrase is shown to you once at wallet creation — store it
          out-of-band; it can recover your funds.
        </li>
      </ul>

      <h2>Deposits &amp; withdrawals</h2>
      <ul>
        <li>
          Deposits are credited only when the transaction is{" "}
          <strong>successful</strong> on-chain, and are{" "}
          <strong>idempotent</strong> on the immutable operation id — a replay
          or reorg can&apos;t double-credit.
        </li>
        <li>
          Withdrawals use an <strong>idempotency key</strong> and a state
          machine, so a retried request can&apos;t double-spend.
        </li>
        <li>
          Octo only ever builds its own payment operations — it never signs
          caller-supplied raw transactions.
        </li>
      </ul>

      <h2>Credentials</h2>
      <ul>
        <li>
          Passwords are hashed with <strong>argon2id</strong>; API keys are
          stored only as a <strong>SHA-256 hash</strong> (a leak can&apos;t
          expose them).
        </li>
        <li>
          API keys are scoped to a single wallet and cannot withdraw. Regenerate
          a key anytime to revoke the old one instantly.
        </li>
      </ul>

      <Callout type="note">
        This MVP uses a single encrypted hot seed (not yet MPC/HSM). It is a
        deliberate, documented tradeoff with a clear upgrade path. Report
        vulnerabilities responsibly — do not open public issues for security
        reports.
      </Callout>
    </Prose>
  );
}
