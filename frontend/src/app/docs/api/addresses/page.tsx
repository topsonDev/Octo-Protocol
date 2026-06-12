import { Prose, Code, Endpoint, ParamTable } from "@/components/docs/DocsUI";

export default function ApiAddresses() {
  return (
    <Prose>
      <p className="text-xs font-semibold uppercase tracking-wide text-burgundy-bright">
        API Reference
      </p>
      <h1 className="mt-2 text-4xl font-semibold text-foreground">Addresses</h1>
      <p>
        Generate dedicated deposit addresses for your customers. Each address is
        a muxed account derived off-chain from your master wallet — instant and
        free.
      </p>

      <h2>Create an address</h2>
      <Endpoint method="POST" path="/v1/wallets/:id/addresses" />
      <p>Body (all optional):</p>
      <ParamTable
        rows={[
          {
            name: "customer_ref",
            type: "string",
            desc: "Your own reference for the user. Echoed in webhooks.",
          },
          {
            name: "metadata",
            type: "object",
            desc: "Arbitrary JSON echoed back in webhooks for reconciliation.",
          },
        ]}
      />
      <Code label="Request">{`curl -X POST http://localhost:8080/v1/wallets/<WALLET_ID>/addresses \\
  -H "authorization: Bearer octo_sk_test_ab12…" \\
  -H "content-type: application/json" \\
  -d '{ "customer_ref": "user_42", "metadata": { "plan": "pro" } }'`}</Code>
      <Code label="Response (201)">{`{
  "statusCode": 201,
  "message": "Created",
  "data": {
    "id": "8d22…",
    "muxed_address": "MA7…",
    "base_address": "GBYK…",
    "memo_id": 7,
    "customer_ref": "user_42",
    "metadata": { "plan": "pro" }
  }
}`}</Code>

      <h2>List addresses</h2>
      <Endpoint method="GET" path="/v1/wallets/:id/addresses" />
      <Code label="Request">{`curl http://localhost:8080/v1/wallets/<WALLET_ID>/addresses \\
  -H "authorization: Bearer octo_sk_test_ab12…"`}</Code>
      <p>
        Returns an array of address objects (same shape as above), most recent
        first.
      </p>
    </Prose>
  );
}
