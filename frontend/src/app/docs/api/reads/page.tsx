import { Prose, Code, Endpoint } from "@/components/docs/DocsUI";

export default function ApiReads() {
  return (
    <Prose>
      <p className="text-xs font-semibold uppercase tracking-wide text-burgundy-bright">
        API Reference
      </p>
      <h1 className="mt-2 text-4xl font-semibold text-foreground">
        Balances &amp; Transactions
      </h1>

      <h2>Get balances</h2>
      <p>Live on-chain balances for the master wallet, read from the network.</p>
      <Endpoint method="GET" path="/v1/wallets/:id/balances" />
      <Code label="Response">{`{
  "data": [
    { "asset_type": "native", "balance": "10000.0000000" }
  ]
}`}</Code>

      <h2>List transactions</h2>
      <p>
        Recorded deposits and withdrawals for the wallet, most recent first.
        Amounts are integer <code>amount_stroops</code> (1 XLM = 10,000,000
        stroops).
      </p>
      <Endpoint method="GET" path="/v1/wallets/:id/transactions" />
      <Code label="Response">{`{
  "data": [
    {
      "id": "924c…",
      "direction": "deposit",
      "asset_code": "native",
      "amount_stroops": 50000000,
      "source_account": "GA…",
      "destination_account": "MA7…",
      "stellar_tx_hash": "7f18…",
      "status": "confirmed",
      "created_at": "2026-06-12T10:00:00Z"
    }
  ]
}`}</Code>

      <h2>Get a wallet</h2>
      <Endpoint method="GET" path="/v1/wallets/:id" />
      <Code label="Response">{`{
  "data": {
    "id": "52775…",
    "network": "testnet",
    "address": "GBYK…",
    "label": "Acme treasury",
    "description": "primary treasury"
  }
}`}</Code>
    </Prose>
  );
}
