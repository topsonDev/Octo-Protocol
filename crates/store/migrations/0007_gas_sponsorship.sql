-- Per-wallet gas sponsorship settings: enable flag, per-tx fee cap, and daily budget (all stroops).
-- One row per wallet maximum; ON DELETE CASCADE keeps this clean when the wallet is removed.

CREATE TABLE IF NOT EXISTS gas_sponsorship_configs (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id             UUID        NOT NULL UNIQUE REFERENCES wallets(id) ON DELETE CASCADE,
    enabled               BOOLEAN     NOT NULL DEFAULT false,
    max_fee_per_tx_stroops BIGINT     NOT NULL DEFAULT 1000000,
    daily_budget_stroops  BIGINT      NOT NULL DEFAULT 100000000,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
