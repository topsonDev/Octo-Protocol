import { Prose, Code, Callout } from "@/components/docs/DocsUI";

export default function ApiAuth() {
  return (
    <Prose>
      <p className="text-xs font-semibold uppercase tracking-wide text-burgundy-bright">
        API Reference
      </p>
      <h1 className="mt-2 text-4xl font-semibold text-foreground">
        Authentication
      </h1>

      <p>
        Octo accepts a bearer token in the <code>Authorization</code> header.
        There are two kinds, for two audiences:
      </p>

      <h2>API key (server-to-server)</h2>
      <p>
        Your integration backend uses a per-wallet API key
        (<code>octo_sk_test_…</code> on testnet). The key maps to exactly one
        wallet, so wallet operations for that wallet are authorized
        automatically.
      </p>
      <Code>{`Authorization: Bearer octo_sk_test_ab12…`}</Code>
      <p>An API key can:</p>
      <ul>
        <li>create and list deposit addresses,</li>
        <li>read the wallet, balances, and transactions,</li>
        <li>register webhook endpoints.</li>
      </ul>

      <Callout type="warning">
        For safety, an API key <strong>cannot withdraw</strong>. Moving funds
        out requires a dashboard login token (below). A key is scoped to its
        wallet — using it against another wallet returns <code>404</code>.
      </Callout>

      <h2>Login token (dashboard)</h2>
      <p>
        The dashboard authenticates users with a session JWT from{" "}
        <code>POST /v1/auth/login</code>. It authorizes everything its owner can
        do — including creating wallets and withdrawing — across all wallets the
        user owns.
      </p>
      <Code>{`# obtain a login token
curl -X POST http://localhost:8080/v1/auth/login \\
  -H "content-type: application/json" \\
  -d '{ "email": "you@acme.com", "password": "•••••••••" }'

# → { "data": { "token": "eyJ…", "user": { … } } }`}</Code>

      <Callout type="note">
        Keep API keys secret and out of source control. If a key leaks,
        regenerate it on the wallet&apos;s Developers page — the old key stops
        working immediately.
      </Callout>
    </Prose>
  );
}
