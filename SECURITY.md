# Security Policy

blockme handles cryptographic seed material and signs blockchain transactions. We take security
seriously and appreciate responsible disclosure.

## Reporting a vulnerability

**Do not open a public GitHub issue for security reports.**

Email **security@blockme.example** (replace with the real address) with:

- a description of the issue and its impact,
- steps to reproduce or a proof of concept,
- any suggested remediation.

We aim to acknowledge within **48 hours** and to provide a remediation timeline within
**7 days**. Please give us a reasonable window to fix the issue before public disclosure.

## Scope

In scope: key management, the signing path, seed encryption, deposit attribution, withdrawal
authorization, webhook signing, and API authentication.

## Security model (summary)

- The HD seed is stored **AES-256-GCM encrypted at rest** with a random nonce + salt; the master
  key comes from a KMS/secret manager (an env var only in development).
- The seed is decrypted **in-memory only**, inside the `wallet-core` crate, at signing time, and
  is **zeroized** immediately after. It is never written to disk or logs.
- Private keys are **derived on demand** (SEP-0005) and never persisted.

See [docs/architecture.md](docs/architecture.md) for details.
