-- Audit log: a per-user, append-only record of notable account activity.
--
-- Categories mirror the dashboard: authentication, wallet, address, credentials, configuration.
-- The `action` is a short verb phrase ("signed in", "created wallet octo master wallet"); `target`
-- optionally names the affected resource. `ip_address` is best-effort from the request.

CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action      TEXT NOT NULL,
    category    TEXT NOT NULL,
    target      TEXT,
    ip_address  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_user_time ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_category ON audit_logs(user_id, category);
