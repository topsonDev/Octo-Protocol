# API reference

> Endpoints are implemented incrementally (see the project plan). This document is kept in sync
> as routes land; a machine-readable OpenAPI spec will follow.

All responses use a consistent envelope:

```json
{ "statusCode": 200, "message": "OK", "data": { } }
```

## Planned endpoints

### Wallets
- `POST /v1/wallets` — create a master wallet for the configured network. Returns `walletId`, `G...`.
- `GET  /v1/wallets/{id}` — wallet details + on-chain balance.

### Addresses
- `POST /v1/wallets/{id}/addresses` — generate a dedicated customer address.
  Returns `muxed_address` (`M...`) **and** `{ base_address, memo_id }` fallback.
- `GET  /v1/wallets/{id}/addresses` — list addresses.

### Withdrawals
- `POST /v1/wallets/{id}/withdraw` — sign + submit a payment from the master wallet
  (single or batch). A sign-only variant returns signed XDR without broadcasting.

### Transactions
- `GET  /v1/wallets/{id}/transactions` — deposits + withdrawals.

### Webhooks
- `POST /v1/webhooks` — register an endpoint (URL + secret).
- Deliveries are signed `HMAC-SHA256` over the raw body; the address `metadata` is echoed.

_Authentication (API keys) and pagination are documented when those land._
