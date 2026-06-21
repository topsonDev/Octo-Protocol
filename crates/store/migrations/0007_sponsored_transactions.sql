-- sponsored_transactions: fee-bump sponsorship history.
--
-- Each row records a single sponsored Stellar transaction (fee-bump), with
-- metadata for reconciliation and debugging. The raw XDR is not stored; clients
-- can reconstruct it from the inner + fee-bump tx hashes and Horizon.

CREATE TABLE sponsored_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id           UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    inner_tx_hash       TEXT NOT NULL,
    fee_bump_tx_hash    TEXT NOT NULL,
    fee_stroops         BIGINT NOT NULL CHECK (fee_stroops >= 0),
    status              TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'confirmed', 'failed')),
    error               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sponsored_tx_wallet ON sponsored_transactions(wallet_id);
-- Composite index for the most common query pattern: wallet-scoped, sorted by
-- creation time descending with cursor-based pagination.
CREATE INDEX idx_sponsored_tx_wallet_created
    ON sponsored_transactions(wallet_id, created_at DESC, id DESC);
