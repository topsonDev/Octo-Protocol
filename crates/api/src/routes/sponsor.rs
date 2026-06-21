//! Fee-bump sponsorship endpoint.
//!
//! Receives a user's already-signed inner transaction, validates it against the wallet's
//! sponsorship policy and operation allowlist, wraps it in a fee-bump signed by the master key,
//! and submits the outer envelope to Horizon. A `transaction.sponsored` webhook fires
//! fire-and-forget afterward — see [`fire_sponsored_event`].
//!
//! Security notes (see `docs/threat-model.md`):
//! - Auth accepts both a dashboard JWT and an API key (`authorize_wallet`), same as withdrawals'
//!   sibling integration endpoints.
//! - The inner tx source must not be the master account (self-sponsorship guard), and only
//!   Payment / PathPayment ops are allowed — enforced by [`crate::sponsor_validation`].
//! - The UNIQUE constraint on `inner_tx_hash` (DB-level) prevents double-sponsoring the same user
//!   transaction.
//! - A per-transaction fee cap and a rolling daily budget are enforced before signing.
//! - Webhook delivery never blocks or alters the HTTP response: the response always reflects the
//!   Horizon outcome first; the webhook fires afterward in a detached task.

use crate::error::{ApiError, ApiResult, Envelope};
use crate::json::parse_optional;
use crate::sponsor_validation::validate_inner_xdr;
use crate::state::AppState;
use axum::body::Bytes;
use axum::extract::{Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::Json;
use octo_crypto::SealedSeed;
use octo_store::NewSponsoredTx;
use octo_wallet_core::{compute_inner_tx_hash, sign_fee_bump, FeeBumpRequest};
use octo_webhooks::Event;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Webhook event type fired after every sponsor request (confirmed or failed outcome).
pub const SPONSORED_EVENT_TYPE: &str = "transaction.sponsored";

#[derive(Debug, Default, Deserialize)]
pub struct SponsorRequest {
    /// Base64-encoded, already-signed `TransactionEnvelope` XDR of the user's inner transaction.
    pub transaction_xdr: Option<String>,
    /// Total fee (in stroops) the master wallet is willing to pay for the fee-bump. Must be > 0
    /// and within the wallet's `per_tx_fee_cap_stroops` / remaining daily budget, if configured.
    pub max_base_fee_stroops: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct SponsorResponse {
    pub id: Uuid,
    pub status: String,
    pub inner_tx_hash: String,
    pub fee_bump_tx_hash: Option<String>,
    pub fee_stroops: i64,
}

/// `POST /v1/wallets/:id/sponsor`
pub async fn sponsor(
    State(state): State<AppState>,
    Path(wallet_id): Path<Uuid>,
    headers: HeaderMap,
    body: Bytes,
) -> ApiResult<(StatusCode, Json<Envelope<SponsorResponse>>)> {
    // Accepts both a dashboard JWT and an API key — sponsorship may be driven by an integration.
    crate::auth::authorize_wallet(&headers, &state, wallet_id).await?;

    let req: SponsorRequest = parse_optional(&body)?;

    let inner_xdr = req
        .transaction_xdr
        .filter(|s| !s.is_empty())
        .ok_or_else(|| ApiError::BadRequest("transaction_xdr is required".into()))?;
    let max_fee = req
        .max_base_fee_stroops
        .filter(|f| *f > 0)
        .ok_or_else(|| ApiError::BadRequest("max_base_fee_stroops must be > 0".into()))?;

    // Load wallet (needed for the sealed seed + master G address for the self-sponsorship check).
    let wallet = state.store().get_wallet(wallet_id).await?;

    // --- sponsorship policy checks ---
    let config = state
        .store()
        .get_gas_sponsorship_config(wallet_id)
        .await
        .map_err(|_| ApiError::Internal)?
        .ok_or_else(|| {
            ApiError::Forbidden("gas sponsorship is not configured for this wallet".into())
        })?;

    if !config.enabled {
        return Err(ApiError::Forbidden(
            "gas sponsorship is disabled for this wallet".into(),
        ));
    }

    if let Some(cap) = config.per_tx_fee_cap_stroops {
        if max_fee > cap {
            return Err(ApiError::Forbidden(format!(
                "requested fee ({max_fee} stroops) exceeds the per-transaction cap ({cap} stroops)"
            )));
        }
    }

    if let Some(budget) = config.daily_budget_stroops {
        let spent_today = state
            .store()
            .sum_sponsored_fees_today(wallet_id)
            .await
            .map_err(|_| ApiError::Internal)?;
        if spent_today + max_fee > budget {
            return Err(ApiError::TooManyRequests(format!(
                "daily sponsorship budget of {budget} stroops would be exceeded \
                 ({spent_today} stroops spent today)"
            )));
        }
    }

    // --- XDR validation (operation allowlist + self-sponsorship guard) ---
    validate_inner_xdr(&inner_xdr, &wallet.stellar_account_g)?;

    // --- compute the inner tx hash (deterministic; the anti-double-sponsor dedup key) ---
    let hash_bytes = compute_inner_tx_hash(&inner_xdr, state.network())
        .map_err(|_| ApiError::BadRequest("invalid transaction_xdr".into()))?;
    let inner_tx_hash = hex::encode(hash_bytes);

    // --- record the pending attempt (UNIQUE on inner_tx_hash blocks double-sponsoring) ---
    let record = state
        .store()
        .record_sponsored_tx(NewSponsoredTx {
            wallet_id,
            inner_tx_hash: &inner_tx_hash,
            fee_stroops: max_fee,
        })
        .await?; // StoreError::Conflict -> ApiError::Conflict (409)

    // --- sign the fee-bump inside wallet-core (decrypt -> derive -> sign -> zeroize) ---
    let sealed = SealedSeed::from_parts(
        wallet.sealed_ciphertext.clone(),
        &wallet.sealed_nonce,
        &wallet.sealed_salt,
    )
    .map_err(|_| ApiError::Internal)?;

    let signed = sign_fee_bump(
        state.master_key(),
        &sealed,
        state.network(),
        0,
        &FeeBumpRequest {
            inner_xdr: &inner_xdr,
            max_base_fee_stroops: max_fee,
        },
    )?;

    // --- submit to Horizon: this outcome is what the HTTP response reflects ---
    let submit = state
        .horizon()
        .submit_transaction(&signed.envelope_xdr)
        .await;

    let (status, fee_bump_hash, err_msg) = match submit {
        Ok(r) if r.successful => ("confirmed", Some(r.hash), None),
        Ok(r) => (
            "failed",
            Some(r.hash),
            Some("transaction failed on-chain".to_string()),
        ),
        Err(_) => ("failed", None, Some("Horizon submission error".to_string())),
    };

    // --- update the record (best-effort; never blocks the response) ---
    let _ = state
        .store()
        .update_sponsored_tx_status(
            record.id,
            status,
            fee_bump_hash.as_deref(),
            err_msg.as_deref(),
        )
        .await;

    // --- audit log (best-effort; only when a user identity is available) ---
    if let Some(user_id) = wallet.user_id {
        crate::audit::record(
            &state,
            user_id,
            &format!("sponsored a fee-bump transaction ({status})"),
            crate::audit::category::SPONSORSHIP,
            Some(&inner_tx_hash),
            &headers,
        )
        .await;
    }

    // --- fire the transaction.sponsored webhook (fire-and-forget, after the outcome is fixed) ---
    fire_sponsored_event(
        state.clone(),
        wallet_id,
        inner_tx_hash.clone(),
        fee_bump_hash.clone(),
        max_fee,
        status,
    );

    let resp = SponsorResponse {
        id: record.id,
        status: status.to_string(),
        inner_tx_hash,
        fee_bump_tx_hash: fee_bump_hash,
        fee_stroops: max_fee,
    };
    let (code, json) = Envelope::created(resp);
    Ok((code, json))
}

/// Build and dispatch the `transaction.sponsored` webhook in a detached task, so it can never
/// delay or change the HTTP response already sent to the caller (it has already been built from
/// `status`/`fee_bump_tx_hash` by the time this runs).
///
/// Delivery itself (sign -> POST -> log to `webhook_deliveries`) is handled by
/// [`octo_webhooks::WebhookSender::dispatch`], which already skips wallets with no active webhook
/// endpoint — so a wallet with none configured is silently and correctly skipped here too.
fn fire_sponsored_event(
    state: AppState,
    wallet_id: Uuid,
    inner_tx_hash: String,
    fee_bump_tx_hash: Option<String>,
    fee_stroops: i64,
    status: &'static str,
) {
    tokio::spawn(async move {
        let event = Event {
            event_type: SPONSORED_EVENT_TYPE.to_string(),
            data: serde_json::json!({
                "wallet_id": wallet_id,
                "inner_tx_hash": inner_tx_hash,
                "fee_bump_tx_hash": fee_bump_tx_hash,
                "fee_stroops": fee_stroops,
                "status": status,
                "created_at": chrono::Utc::now(),
            }),
        };
        state.webhooks().dispatch(wallet_id, &event).await;
    });
}
