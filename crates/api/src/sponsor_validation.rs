//! XDR operation-type allowlist for gas sponsorship (`docs/threat-model.md` §B).
//!
//! Sponsoring a fee-bump means signing whatever the user's inner transaction does — so the set of
//! operations a sponsored transaction may contain is deliberately narrow: only payments. Anything
//! that could mutate account state (trustlines, signers, offers, sponsorship of *other* reserves,
//! contract invocations, ...) is rejected before it ever reaches [`octo_wallet_core::sign_fee_bump`].

use crate::error::ApiError;
use stellar_base::crypto::{MuxedAccount, PublicKey};
use stellar_base::operations::Operation;
use stellar_base::transaction::TransactionEnvelope;
use stellar_base::xdr::XDRDeserialize;

/// Operation types permitted inside a sponsored (fee-bumped) inner transaction.
pub const ALLOWED_OP_TYPES: &[&str] = &[
    "Payment",
    "PathPaymentStrictSend",
    "PathPaymentStrictReceive",
];

/// Parse `inner_xdr` and reject it unless every operation is in [`ALLOWED_OP_TYPES`] and the inner
/// transaction's source account is not the master account (anti self-sponsorship).
///
/// Must be called **before** [`octo_wallet_core::sign_fee_bump`] so the signing path never sees a
/// forbidden operation or a self-sponsorship loop.
pub fn validate_inner_xdr(inner_xdr: &str, master_account_g: &str) -> Result<(), ApiError> {
    let env = TransactionEnvelope::from_xdr_base64(inner_xdr)
        .map_err(|_| ApiError::BadRequest("transaction_xdr is not valid base64 XDR".into()))?;

    let tx = match env {
        TransactionEnvelope::Transaction(tx) => tx,
        TransactionEnvelope::FeeBumpTransaction(_) => {
            return Err(ApiError::BadRequest(
                "transaction_xdr must not be a fee-bump envelope".into(),
            ))
        }
    };

    let master_pk = PublicKey::from_account_id(master_account_g)
        .map_err(|_| ApiError::BadRequest("invalid master account address".into()))?;
    if source_matches(tx.source_account(), &master_pk) {
        return Err(ApiError::BadRequest(
            "inner transaction source must not be the master account".into(),
        ));
    }

    for op in tx.operations() {
        let name = op_type_name(op);
        if !ALLOWED_OP_TYPES.contains(&name) {
            return Err(ApiError::BadRequest(format!(
                "operation type '{name}' is not allowed in a sponsored transaction; \
                 allowed types: {}",
                ALLOWED_OP_TYPES.join(", ")
            )));
        }
    }

    Ok(())
}

/// `true` when `source`'s underlying ed25519 key matches `master` (muxed-aware: compares the base
/// key, not the muxed `M...` string, so a muxed source of the master account is still caught).
fn source_matches(source: &MuxedAccount, master: &PublicKey) -> bool {
    match source {
        MuxedAccount::Ed25519(pk) => pk == master,
        MuxedAccount::MuxedEd25519(mx) => mx.public_key() == master,
    }
}

fn op_type_name(op: &Operation) -> &'static str {
    match op {
        Operation::CreateAccount(_) => "CreateAccount",
        Operation::Payment(_) => "Payment",
        Operation::PathPaymentStrictReceive(_) => "PathPaymentStrictReceive",
        Operation::ManageSellOffer(_) => "ManageSellOffer",
        Operation::CreatePassiveSellOffer(_) => "CreatePassiveSellOffer",
        Operation::SetOptions(_) => "SetOptions",
        Operation::ChangeTrust(_) => "ChangeTrust",
        Operation::AllowTrust(_) => "AllowTrust",
        Operation::AccountMerge(_) => "AccountMerge",
        Operation::Inflation(_) => "Inflation",
        Operation::ManageData(_) => "ManageData",
        Operation::BumpSequence(_) => "BumpSequence",
        Operation::ManageBuyOffer(_) => "ManageBuyOffer",
        Operation::PathPaymentStrictSend(_) => "PathPaymentStrictSend",
        Operation::CreateClaimableBalance(_) => "CreateClaimableBalance",
        Operation::ClaimClaimableBalance(_) => "ClaimClaimableBalance",
        Operation::BeginSponsoringFutureReserves(_) => "BeginSponsoringFutureReserves",
        Operation::EndSponsoringFutureReserves(_) => "EndSponsoringFutureReserves",
        Operation::RevokeSponsorship(_) => "RevokeSponsorship",
        Operation::Clawback(_) => "Clawback",
        Operation::ClawbackClaimableBalance(_) => "ClawbackClaimableBalance",
        Operation::SetTrustLineFlags(_) => "SetTrustLineFlags",
        Operation::LiquidityPoolDeposit(_) => "LiquidityPoolDeposit",
        Operation::LiquidityPoolWithdraw(_) => "LiquidityPoolWithdraw",
        Operation::InvokeHostFunction(_) => "InvokeHostFunction",
        Operation::ExtendFootprintTtl(_) => "ExtendFootprintTtl",
        Operation::RestoreFootprint(_) => "RestoreFootprint",
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use octo_wallet_core::{import_wallet, sign_payment, PaymentRequest, StellarNetwork};
    use stellar_base::amount::Stroops;
    use stellar_base::crypto::DalekKeyPair;
    use stellar_base::transaction::{Transaction, MIN_BASE_FEE};
    use stellar_base::xdr::XDRSerialize;

    const VECTOR_MK: [u8; 32] = [7u8; 32];
    const VECTOR_MNEMONIC: &str =
        "illness spike retreat truth genius clock brain pass fit cave bargain toe";
    /// Account 0 of the vector seed.
    const MASTER_ACCOUNT_0: &str = "GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6";
    /// Account 1 of the vector seed — used as a destination distinct from account 0.
    const DEST: &str = "GBAW5XGWORWVFE2XTJYDTLDHXTY2Q2MO73HYCGB3XMFMQ562Q2W2GJQX";

    /// A valid payment XDR signed by account 0 of the vector mnemonic (source = MASTER_ACCOUNT_0).
    fn payment_xdr() -> String {
        let provisioned =
            import_wallet(&VECTOR_MK, StellarNetwork::Testnet, VECTOR_MNEMONIC).unwrap();
        sign_payment(
            &VECTOR_MK,
            &provisioned.sealed,
            StellarNetwork::Testnet,
            0,
            &PaymentRequest {
                destination: DEST,
                stroops: 100,
                asset: None,
                memo_id: None,
                sequence: 1,
            },
        )
        .unwrap()
        .envelope_xdr
    }

    /// Build a minimal (unsigned) inner XDR with one `AccountMerge` operation, sourced from a
    /// throwaway random keypair (never the master account).
    fn account_merge_xdr() -> String {
        let kp = DalekKeyPair::random().unwrap();
        let dest_pk = stellar_base::crypto::PublicKey::from_account_id(DEST).unwrap();
        let op = Operation::new_account_merge()
            .with_destination(dest_pk.into())
            .build()
            .unwrap();
        let tx = Transaction::builder(kp.public_key(), 1, MIN_BASE_FEE)
            .add_operation(op)
            .into_transaction()
            .unwrap();
        tx.into_envelope().xdr_base64().unwrap()
    }

    /// Build a minimal (unsigned) inner XDR with one forbidden `SetOptions` op.
    fn set_options_xdr() -> String {
        let kp = DalekKeyPair::random().unwrap();
        let op = Operation::new_set_options().build().unwrap();
        let tx = Transaction::builder(kp.public_key(), 1, MIN_BASE_FEE)
            .add_operation(op)
            .into_transaction()
            .unwrap();
        tx.into_envelope().xdr_base64().unwrap()
    }

    #[test]
    fn allows_payment_op() {
        let xdr = payment_xdr();
        // Sponsor master is DEST, distinct from the inner tx's source (MASTER_ACCOUNT_0).
        assert!(validate_inner_xdr(&xdr, DEST).is_ok());
    }

    #[test]
    fn rejects_account_merge() {
        let xdr = account_merge_xdr();
        let result = validate_inner_xdr(&xdr, MASTER_ACCOUNT_0);
        assert!(
            matches!(result, Err(ApiError::BadRequest(ref m)) if m.contains("AccountMerge")),
            "expected AccountMerge rejection, got: {result:?}"
        );
    }

    #[test]
    fn rejects_set_options() {
        let xdr = set_options_xdr();
        let result = validate_inner_xdr(&xdr, MASTER_ACCOUNT_0);
        assert!(
            matches!(result, Err(ApiError::BadRequest(ref m)) if m.contains("SetOptions")),
            "expected SetOptions rejection, got: {result:?}"
        );
    }

    #[test]
    fn rejects_self_sponsorship() {
        // payment_xdr() is signed FROM MASTER_ACCOUNT_0; passing the same address as the
        // sponsor's master account triggers the self-sponsorship guard.
        let xdr = payment_xdr();
        let result = validate_inner_xdr(&xdr, MASTER_ACCOUNT_0);
        assert!(
            matches!(result, Err(ApiError::BadRequest(ref m)) if m.contains("master")),
            "expected self-sponsorship rejection, got: {result:?}"
        );
    }

    #[test]
    fn rejects_malformed_xdr() {
        let result = validate_inner_xdr("this-is-not-valid-xdr!!!", DEST);
        assert!(matches!(result, Err(ApiError::BadRequest(_))));
    }

    #[test]
    fn rejects_fee_bump_as_inner() {
        // Wrap a payment in a fee-bump, then try to use the fee-bump envelope as the "inner" tx.
        let inner = payment_xdr();
        let inner_env = TransactionEnvelope::from_xdr_base64(&inner).unwrap();
        let inner_tx = match inner_env {
            TransactionEnvelope::Transaction(tx) => tx,
            _ => unreachable!(),
        };
        let kp = DalekKeyPair::random().unwrap();
        let fee_bump = stellar_base::transaction::FeeBumpTransaction::new(
            kp.public_key().into(),
            Stroops::new(200),
            inner_tx,
        );
        let xdr = fee_bump.into_envelope().xdr_base64().unwrap();
        let result = validate_inner_xdr(&xdr, DEST);
        assert!(matches!(result, Err(ApiError::BadRequest(_))));
    }
}
