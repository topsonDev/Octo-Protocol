-- Gas sponsorship: per-wallet config and an immutable audit trail of every sponsored fee-bump.
--
-- gas_sponsorship_configs — controls whether a wallet may sponsor third-party transactions, and
--   enforces a per-transaction fee cap and a rolling daily budget (in stroops).
-- sponsored_transactions — append-only record of every fee-bump attempt; the source of truth for
--   daily budget enforcement (sum of confirmed fee_stroops for today) and double-submit detection
--   (UNIQUE on inner_tx_hash).

CREATE TABLE gas_sponsorship_configs (
    wallet_id               UUID PRIMARY KEY REFERENCES wallets(id) ON DELETE CASCADE,
    enabled                  BOOLEAN NOT NULL DEFAULT true,
    -- Maximum fee (in stroops) the sponsor will pay for a single transaction. NULL = no cap.
    per_tx_fee_cap_stroops  BIGINT,
    -- Rolling UTC-day budget (in stroops). NULL = no budget limit.
    daily_budget_stroops    BIGINT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sponsored_transactions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id         UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    -- Hash of the user's inner transaction (the txID in explorers) — the dedup key.
    inner_tx_hash     TEXT NOT NULL,
    -- Hash of the outer fee-bump transaction; NULL until/unless submission succeeds.
    fee_bump_tx_hash  TEXT,
    -- Actual fee charged to the sponsor, in stroops.
    fee_stroops       BIGINT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'confirmed', 'failed')),
    -- Horizon error detail on failure; ops-only, never returned to callers.
    error             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent double-sponsoring the same user transaction.
CREATE UNIQUE INDEX idx_sponsored_inner_tx_hash ON sponsored_transactions(inner_tx_hash);

-- Fast daily-budget sum: confirmed rows for a wallet, scanned by time.
CREATE INDEX idx_sponsored_wallet_time ON sponsored_transactions(wallet_id, created_at);
