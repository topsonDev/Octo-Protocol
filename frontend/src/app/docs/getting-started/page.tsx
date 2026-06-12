import Link from "next/link";
import { Prose, Step, Code, Callout } from "@/components/docs/DocsUI";

export default function GettingStarted() {
  return (
    <div>
      <Prose>
        <p className="text-xs font-semibold uppercase tracking-wide text-burgundy-bright">
          Getting Started
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-foreground">
          From 0 to integration
        </h1>
        <p>
          This guide takes you from a fresh account to a working stablecoin
          integration: create a master wallet, generate an API key, hand a
          customer a deposit address, receive the deposit webhook, and pay out.
        </p>

        <Callout type="note">
          <strong>What you&apos;ll need:</strong> an Octo account and your{" "}
          <strong>Wallet ID</strong> + <strong>API key</strong> (Step 2). The
          base URL is <code>http://localhost:8080</code> in local development.
        </Callout>
      </Prose>

      <div className="mt-10">
        <Step n={1} title="Create an account & master wallet">
          <p>
            Sign up in the dashboard, then create a master wallet. On testnet
            it&apos;s funded automatically. You&apos;ll get back a{" "}
            <strong>Wallet ID</strong> and a one-time recovery phrase — store the
            phrase securely.
          </p>
          <p className="mt-3">
            Prefer the API? Sign up and create a wallet with your login token:
          </p>
          <Code label="cURL">{`# create a master wallet (login-token auth)
curl -X POST http://localhost:8080/v1/wallets \\
  -H "authorization: Bearer <LOGIN_TOKEN>" \\
  -H "content-type: application/json" \\
  -d '{"label":"Acme treasury"}'`}</Code>
        </Step>

        <Step n={2} title="Generate your API key">
          <p>
            On the wallet&apos;s <strong>Developers</strong> page, click{" "}
            <em>Generate API Key</em>. The full key (<code>octo_sk_test_…</code>)
            is shown <strong>once</strong> — copy it now. This key authorizes
            integration requests for this wallet.
          </p>
          <Code label="cURL">{`curl -X POST http://localhost:8080/v1/wallets/<WALLET_ID>/api-key \\
  -H "authorization: Bearer <LOGIN_TOKEN>"

# → { "data": { "api_key": "octo_sk_test_ab12…", "prefix": "octo_sk_test_ab12" } }`}</Code>
        </Step>

        <Step n={3} title="Create a deposit address for a customer">
          <p>
            When a user wants to deposit, generate a dedicated address. Pass a{" "}
            <code>customer_ref</code> and any <code>metadata</code> — both are
            echoed back to you in webhooks for reconciliation.
          </p>
          <Code label="cURL">{`curl -X POST http://localhost:8080/v1/wallets/<WALLET_ID>/addresses \\
  -H "authorization: Bearer octo_sk_test_ab12…" \\
  -H "content-type: application/json" \\
  -d '{ "customer_ref": "user_42", "metadata": { "plan": "pro" } }'`}</Code>
          <Code label="Response">{`{
  "statusCode": 201,
  "message": "Created",
  "data": {
    "muxed_address": "MA7…",        // give this to your user
    "base_address": "GBYK…",        // G…+memo fallback
    "memo_id": 7,
    "customer_ref": "user_42"
  }
}`}</Code>
          <p className="mt-3">
            Show <code>muxed_address</code> to your user as their deposit
            destination. If their wallet can&apos;t send to <code>M…</code>, give
            them <code>base_address</code> + memo <code>memo_id</code> instead.
          </p>
        </Step>

        <Step n={4} title="Receive the deposit webhook">
          <p>
            Register a webhook endpoint once. When a deposit confirms on-chain,
            Octo POSTs a signed <code>deposit.created</code> event to your URL,
            including the address <code>metadata</code>.
          </p>
          <Code label="cURL — register endpoint">{`curl -X POST http://localhost:8080/v1/wallets/<WALLET_ID>/webhooks \\
  -H "authorization: Bearer octo_sk_test_ab12…" \\
  -H "content-type: application/json" \\
  -d '{ "url": "https://your.app/webhooks/octo" }'

# → returns a signing secret (shown once)`}</Code>
          <Code label="Event delivered to your URL">{`POST https://your.app/webhooks/octo
X-Octo-Signature: <hmac-sha256 hex>

{
  "event": "deposit.created",
  "data": {
    "amount_stroops": 50000000,
    "asset_code": "native",
    "memo_id": 7,
    "status": "confirmed",
    "metadata": { "plan": "pro" }
  }
}`}</Code>
          <p className="mt-3">
            Verify the signature (see{" "}
            <Link href="/docs/webhooks">Webhooks</Link>), then credit your user.
          </p>
        </Step>

        <Step n={5} title="Pay out (withdraw)">
          <p>
            To send funds out of the master wallet, call withdraw. For safety,
            withdrawals require a <strong>dashboard login token</strong>, not an
            API key. An <code>Idempotency-Key</code> makes retries safe.
          </p>
          <Code label="cURL">{`curl -X POST http://localhost:8080/v1/wallets/<WALLET_ID>/withdraw \\
  -H "authorization: Bearer <LOGIN_TOKEN>" \\
  -H "Idempotency-Key: payout-9f3c" \\
  -H "content-type: application/json" \\
  -d '{ "destination": "G…DEST", "amount_stroops": 10000000 }'`}</Code>
          <Callout type="warning">
            Amounts are integer <strong>stroops</strong> (1 XLM = 10,000,000
            stroops). Reusing an <code>Idempotency-Key</code> returns the
            original result instead of paying twice.
          </Callout>
        </Step>
      </div>

      <Prose>
        <h2>That&apos;s it</h2>
        <p>
          You now have the full deposit → notify → withdraw loop. See the{" "}
          <Link href="/docs/api">API Reference</Link> for every endpoint and the{" "}
          <Link href="/docs/webhooks">Webhooks</Link> guide for signature
          verification.
        </p>
      </Prose>
    </div>
  );
}
