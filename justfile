# blockme dev tasks — run `just <task>`. Install: cargo install just
set dotenv-load := true

# List available tasks.
default:
    @just --list

# Build the whole workspace.
build:
    cargo build --workspace

# Run all tests.
test:
    cargo test --workspace

# Format the code.
fmt:
    cargo fmt --all

# Check formatting (CI mode).
fmt-check:
    cargo fmt --all -- --check

# Lint with clippy, warnings as errors.
lint:
    cargo clippy --workspace --all-targets -- -D warnings

# Dependency/license/advisory audit.
deny:
    cargo deny check

# Everything CI runs.
ci: fmt-check lint test deny

# Start local Postgres.
db-up:
    docker compose up -d db

# Stop local services.
db-down:
    docker compose down

# Run database migrations (after store crate lands).
migrate:
    sqlx migrate run --source crates/store/migrations

# Run the server.
run:
    cargo run -p blockme-server
