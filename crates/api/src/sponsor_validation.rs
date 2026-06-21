//! XDR operation-type allowlist for gas-sponsorship (§B of docs/threat-model.md).

use crate::error::ApiError;
use stellar_base::xdr::{MuxedAccount, OperationBody, TransactionEnvelope, XDRDeserialize};

/// Only these operation types may appear in a user-supplied inner transaction.
pub const ALLOWED_OP_TYPES: &[&str] = &[
    "Payment",
    "PathPaymentStrictSend",
    "PathPaymentStrictReceive",
];

/// Parse `inner_xdr`, reject forbidden ops and self-sponsorship, or return Ok(()).
pub fn validate_inner_xdr(inner_xdr: &str, master_account_g: &str) -> Result<(), ApiError> {
    let envelope = TransactionEnvelope::from_xdr_base64(inner_xdr)
        .map_err(|_| ApiError::BadRequest("malformed XDR".into()))?;

    let (source_bytes, operations) = extract_source_and_ops(&envelope)?;

    // Reject self-sponsorship loops.
    let master_pk = stellar_strkey::ed25519::PublicKey::from_string(master_account_g)
        .map_err(|_| ApiError::BadRequest("invalid master account address".into()))?;
    if source_bytes == master_pk.0 {
        return Err(ApiError::BadRequest(
            "inner transaction source must not be the master account".into(),
        ));
    }

    // Validate every operation against the allowlist.
    for op in operations {
        let name = op_type_name(&op.body);
        if !ALLOWED_OP_TYPES.contains(&name) {
            return Err(ApiError::BadRequest(format!(
                "operation type '{}' is not allowed in a sponsored transaction",
                name
            )));
        }
    }

    Ok(())
}

// Returns (source ed25519 bytes, operation slice) for V0 and V1 envelopes.
fn extract_source_and_ops(
    envelope: &TransactionEnvelope,
) -> Result<([u8; 32], &[stellar_base::xdr::Operation]), ApiError> {
    match envelope {
        TransactionEnvelope::Tx(e) => {
            let bytes = match &e.tx.source_account {
                MuxedAccount::Ed25519(k) => k.0,
                MuxedAccount::MuxedEd25519(m) => m.ed25519.0,
            };
            Ok((bytes, &e.tx.operations))
        }
        TransactionEnvelope::TxV0(e) => Ok((e.tx.source_account_ed25519.0, &e.tx.operations)),
        TransactionEnvelope::TxFeeBump(_) => Err(ApiError::BadRequest(
            "fee-bump envelope cannot be used as an inner transaction".into(),
        )),
    }
}

// Map an OperationBody variant to its canonical name for error messages.
fn op_type_name(body: &OperationBody) -> &'static str {
    match body {
        OperationBody::CreateAccount(_) => "CreateAccount",
        OperationBody::Payment(_) => "Payment",
        OperationBody::PathPaymentStrictReceive(_) => "PathPaymentStrictReceive",
        OperationBody::ManageSellOffer(_) => "ManageSellOffer",
        OperationBody::CreatePassiveSellOffer(_) => "CreatePassiveSellOffer",
        OperationBody::SetOptions(_) => "SetOptions",
        OperationBody::ChangeTrust(_) => "ChangeTrust",
        OperationBody::AllowTrust(_) => "AllowTrust",
        OperationBody::AccountMerge(_) => "AccountMerge",
        OperationBody::Inflation => "Inflation",
        OperationBody::ManageData(_) => "ManageData",
        OperationBody::BumpSequence(_) => "BumpSequence",
        OperationBody::ManageBuyOffer(_) => "ManageBuyOffer",
        OperationBody::PathPaymentStrictSend(_) => "PathPaymentStrictSend",
        OperationBody::CreateClaimableBalance(_) => "CreateClaimableBalance",
        OperationBody::ClaimClaimableBalance(_) => "ClaimClaimableBalance",
        OperationBody::BeginSponsoringFutureReserves(_) => "BeginSponsoringFutureReserves",
        OperationBody::EndSponsoringFutureReserves => "EndSponsoringFutureReserves",
        OperationBody::RevokeSponsorship(_) => "RevokeSponsorship",
        OperationBody::Clawback(_) => "Clawback",
        OperationBody::ClawbackClaimableBalance(_) => "ClawbackClaimableBalance",
        OperationBody::SetTrustLineFlags(_) => "SetTrustLineFlags",
        OperationBody::LiquidityPoolDeposit(_) => "LiquidityPoolDeposit",
        OperationBody::LiquidityPoolWithdraw(_) => "LiquidityPoolWithdraw",
        OperationBody::InvokeHostFunction(_) => "InvokeHostFunction",
        OperationBody::ExtendFootprintTtl(_) => "ExtendFootprintTtl",
        OperationBody::RestoreFootprint(_) => "RestoreFootprint",
        #[allow(unreachable_patterns)]
        _ => "Unknown",
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use stellar_base::xdr::{
        Asset, Int64, Memo, MuxedAccount, Operation, OperationBody, PaymentOp, Preconditions,
        SequenceNumber, SetOptionsOp, Transaction, TransactionEnvelope, TransactionExt,
        TransactionV1Envelope, Uint256, VecM, XDRSerialize,
    };

    const MASTER_G: &str = "GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6";
    const OTHER_G: &str = "GBAW5XGWORWVFE2XTJYDTLDHXTY2Q2MO73HYCGB3XMFMQ562Q2W2GJQX";

    // Build a V1 TransactionEnvelope from a source G... address and a list of operations.
    fn make_envelope(source_g: &str, ops: Vec<Operation>) -> String {
        let pk = stellar_strkey::ed25519::PublicKey::from_string(source_g).unwrap();
        let tx = Transaction {
            source_account: MuxedAccount::Ed25519(Uint256(pk.0)),
            fee: 100,
            seq_num: SequenceNumber(1),
            cond: Preconditions::None,
            memo: Memo::None,
            operations: ops.try_into().unwrap(),
            ext: TransactionExt::V0,
        };
        let env = TransactionEnvelope::Tx(TransactionV1Envelope {
            tx,
            signatures: VecM::default(),
        });
        env.xdr_base64().unwrap()
    }

    fn payment_op() -> Operation {
        Operation {
            source_account: None,
            body: OperationBody::Payment(PaymentOp {
                destination: MuxedAccount::Ed25519(Uint256([1u8; 32])),
                asset: Asset::Native,
                amount: Int64(10_000_000),
            }),
        }
    }

    fn account_merge_op() -> Operation {
        Operation {
            source_account: None,
            body: OperationBody::AccountMerge(MuxedAccount::Ed25519(Uint256([2u8; 32]))),
        }
    }

    fn set_options_op() -> Operation {
        Operation {
            source_account: None,
            body: OperationBody::SetOptions(SetOptionsOp {
                inflation_dest: None,
                clear_flags: None,
                set_flags: None,
                master_weight: None,
                low_threshold: None,
                med_threshold: None,
                high_threshold: None,
                home_domain: None,
                signer: None,
            }),
        }
    }

    #[test]
    fn allows_payment_op() {
        let xdr = make_envelope(OTHER_G, vec![payment_op()]);
        assert!(validate_inner_xdr(&xdr, MASTER_G).is_ok());
    }

    #[test]
    fn rejects_account_merge() {
        let xdr = make_envelope(OTHER_G, vec![account_merge_op()]);
        let err = validate_inner_xdr(&xdr, MASTER_G).unwrap_err();
        assert!(matches!(err, ApiError::BadRequest(m) if m.contains("AccountMerge")));
    }

    #[test]
    fn rejects_set_options() {
        let xdr = make_envelope(OTHER_G, vec![set_options_op()]);
        let err = validate_inner_xdr(&xdr, MASTER_G).unwrap_err();
        assert!(matches!(err, ApiError::BadRequest(m) if m.contains("SetOptions")));
    }

    #[test]
    fn rejects_self_sponsorship() {
        let xdr = make_envelope(MASTER_G, vec![payment_op()]);
        let err = validate_inner_xdr(&xdr, MASTER_G).unwrap_err();
        assert!(matches!(err, ApiError::BadRequest(m) if m.contains("master account")));
    }

    #[test]
    fn rejects_malformed_xdr() {
        let err = validate_inner_xdr("not-valid-xdr", MASTER_G).unwrap_err();
        assert!(matches!(err, ApiError::BadRequest(_)));
    }
}
