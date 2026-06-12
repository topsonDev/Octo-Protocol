-- Associate wallets with the user who created them, so the dashboard can list "your wallets".
-- Nullable for backward compatibility with any wallet created before auth existed.

ALTER TABLE wallets ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE wallets ADD COLUMN description TEXT;

CREATE INDEX idx_wallets_user ON wallets(user_id);
