<div align="center">

# blockme

**Stellar-native master-wallet infrastructure** — Wallet-as-a-Service for stablecoins.

[![CI](https://github.com/blockme/blockme/actions/workflows/ci.yml/badge.svg)](https://github.com/blockme/blockme/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

</div>

blockme lets a fintech manage stablecoin deposits on Stellar from a **single master wallet**:
generate a dedicated deposit address per customer, detect deposits in real time, and initiate
withdrawals — all behind a REST API with signed webhooks, and a non-custodial key model.

It replicates the "master wallet" backbone of platforms like Blockradar, but built **Stellar-first**.

## Why this is simple on Stellar: muxed accounts

Instead of deploying a funded on-chain account per customer (and sweeping funds back), blockme
uses **muxed accounts** (`M...`): one real account (`G...`) plus a per-customer 64-bit id encoded
into the address. Deposits to a customer's `M...` land directly in the master account and carry
the id, so:

- **no auto-sweep** — funds are already in the master,
- **no per-user XLM reserve** — only one account exists on-chain,
- **generating an address is free and off-chain** — just assign the next id.

For senders that don't yet accept `M...` (e.g. some exchanges), blockme also exposes the
equivalent **`G...` + numeric memo** form, and attributes deposits by **muxed id _or_ memo id**.
See [docs/deposit-model.md](docs/deposit-model.md).

## Architecture

A Cargo workspace; all secret-handling is isolated in `wallet-core` and zeroized after signing.

| Crate | Responsibility |
|---|---|
| [`crates/crypto`](crates/crypto) | AES-256-GCM seal/open of the HD seed (random nonce + salt) |
| [`crates/wallet-core`](crates/wallet-core) | SEP-0005 ed25519 derivation, muxed encode/decode, tx sign + `zeroize` |
| [`crates/store`](crates/store) | Postgres models + migrations (sqlx) |
| [`crates/webhooks`](crates/webhooks) | HMAC-SHA256 signed outbound webhooks + delivery log |
| [`crates/ingest`](crates/ingest) | Horizon payment streaming + durable cursor → deposit detection |
| [`crates/api`](crates/api) | axum REST API |
| [`bin/server`](bin/server) | composes `api` + `ingest` into one service |

See [docs/architecture.md](docs/architecture.md).

## Quickstart

```bash
# 1. Tooling: Rust 1.84.1 (pinned via rust-toolchain.toml), Docker, just
cp .env.example .env                 # then fill MASTER_KEY (openssl rand -base64 32)

# 2. Local Postgres
docker compose up -d db

# 3. Build & test
just build
just test

# 4. Run (after the API lands in later steps)
just run
```

## Security

This is custody-adjacent software. The HD seed is encrypted at rest (AES-256-GCM) and only ever
decrypted in-memory inside `wallet-core` at signing time, then wiped. Report vulnerabilities per
[SECURITY.md](SECURITY.md). **Do not** open public issues for security reports.

## Status

Early development — built step by step. See the workspace crates for what's implemented.

## License

MIT — see [LICENSE](LICENSE).
