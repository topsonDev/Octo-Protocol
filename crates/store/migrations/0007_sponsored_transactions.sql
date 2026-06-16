-- Sponsored transactions: an immutable audit trail of every fee-bump the master wallet sponsors.
--
-- Serves two purposes:
--   1. Audit/debugging — what was sponsored, the fee charged, and the resulting hashes.
--   2. Daily budget enforcement — the API layer SUMs `fee_stroops` for the current UTC day
--      (status = 'confirmed') before accepting a new sponsorship request.
--
-- The unique index on `inner_tx_hash` prevents double-sponsoring the same user transaction at the
-- DB level (not just in application code). All monetary fields are i64 stroops (never floats).

CREATE TABLE sponsored_transactions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id         UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    inner_tx_hash     TEXT NOT NULL,            -- hash of the user's inner transaction
    fee_bump_tx_hash  TEXT,                     -- hash of the outer fee-bump tx (NULL if submission failed)
    fee_stroops       BIGINT NOT NULL,          -- actual fee charged to the sponsor
    status            TEXT NOT NULL DEFAULT 'pending',  -- pending | confirmed | failed
    error             TEXT,                     -- Horizon error detail if failed
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One sponsorship per inner transaction — anti double-sponsoring.
CREATE UNIQUE INDEX idx_sponsored_inner_tx_hash ON sponsored_transactions(inner_tx_hash);

-- Daily budget sum: filtered by wallet, status, and day.
CREATE INDEX idx_sponsored_wallet_time ON sponsored_transactions(wallet_id, created_at);
