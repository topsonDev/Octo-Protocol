-- Users for dashboard auth.
--
-- Passwords are stored only as argon2id PHC-string hashes (never plaintext, never reversible).
-- Email is unique and stored lowercased by the application.

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL,
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (email)
);
