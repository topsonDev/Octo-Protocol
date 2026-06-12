-- Per-wallet API keys for developer integration.
--
-- Only a SHA-256 hash of the key is stored (never the key itself); a short non-secret prefix is
-- kept for display ("octo_sk_test_ab12…"). A wallet has at most one active key; regenerating
-- replaces it. The full key is shown to the user exactly once, at generation time.

CREATE TABLE api_keys (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id   UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    -- Non-secret display prefix, e.g. "octo_sk_test_ab12".
    prefix      TEXT NOT NULL,
    -- SHA-256 hex of the full key.
    key_hash    TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- One active key per wallet.
    UNIQUE (wallet_id)
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
