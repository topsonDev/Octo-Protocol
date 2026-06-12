import { Prose, Code, Endpoint, ParamTable, Callout } from "@/components/docs/DocsUI";

export default function ApiWithdrawals() {
  return (
    <Prose>
      <p className="text-xs font-semibold uppercase tracking-wide text-burgundy-bright">
        API Reference
      </p>
      <h1 className="mt-2 text-4xl font-semibold text-foreground">
        Withdrawals
      </h1>
      <p>
        Send funds out of the master wallet. Octo builds, signs, and submits the
        Stellar payment for you; the seed is decrypted only in-memory at signing
        time and wiped immediately after.
      </p>

      <Callout type="warning">
        Withdrawals require a <strong>dashboard login token</strong>. API keys
        are rejected (<code>401</code>) so an integration credential can never
        move funds out.
      </Callout>

      <h2>Create a withdrawal</h2>
      <Endpoint method="POST" path="/v1/wallets/:id/withdraw" />
      <ParamTable
        rows={[
          {
            name: "destination",
            type: "string",
            required: true,
            desc: "Destination account (G…) or muxed (M…) address.",
          },
          {
            name: "amount_stroops",
            type: "integer",
            required: true,
            desc: "Amount in stroops (1 XLM = 10,000,000). Must be > 0.",
          },
          {
            name: "memo_id",
            type: "integer",
            desc: "Optional numeric memo on the payment.",
          },
          {
            name: "Idempotency-Key",
            type: "header",
            required: true,
            desc: "Unique per withdrawal. Reusing it returns the original result (no double-spend).",
          },
        ]}
      />
      <Code label="Request">{`curl -X POST http://localhost:8080/v1/wallets/<WALLET_ID>/withdraw \\
  -H "authorization: Bearer <LOGIN_TOKEN>" \\
  -H "Idempotency-Key: payout-9f3c" \\
  -H "content-type: application/json" \\
  -d '{ "destination": "G…DEST", "amount_stroops": 10000000 }'`}</Code>
      <Code label="Response (201)">{`{
  "statusCode": 201,
  "message": "Created",
  "data": {
    "id": "b41a…",
    "status": "confirmed",
    "stellar_tx_hash": "9c0d…",
    "destination": "G…DEST",
    "amount_stroops": 10000000
  }
}`}</Code>
      <p>
        <code>status</code> is <code>confirmed</code> when the transaction
        succeeded on-chain, or <code>failed</code> otherwise. A retry with the
        same <code>Idempotency-Key</code> returns <code>409</code>.
      </p>
    </Prose>
  );
}
