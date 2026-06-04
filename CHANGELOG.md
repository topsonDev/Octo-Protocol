# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Workspace scaffold: `crypto`, `wallet-core`, `store`, `webhooks`, `ingest`, `api` crates and
  the `server` binary.
- Repository tooling: CI (fmt, clippy, test, cargo-deny), `justfile`, `docker-compose` for local
  Postgres, contribution/security docs, MIT license.
- Pinned dependency set verified against the official SEP-0005 test vectors and Stellar muxed
  (`M...`) address round-trips.
