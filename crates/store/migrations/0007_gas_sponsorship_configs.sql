-- Gas sponsorship configuration per master wallet.
--
-- One row per wallet (upserted). All amounts are BIGINT stroops.
-- If no row exists, the API returns defaults without writing to the DB.

CREATE TABLE gas_sponsorship_configs (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id                UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    enabled                  BOOLEAN NOT NULL DEFAULT false,
    max_fee_per_tx_stroops   BIGINT NOT NULL DEFAULT 1000000 CHECK (max_fee_per_tx_stroops > 0),
    daily_budget_stroops     BIGINT NOT NULL DEFAULT 100000000
                               CHECK (daily_budget_stroops >= max_fee_per_tx_stroops),
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (wallet_id)
);
