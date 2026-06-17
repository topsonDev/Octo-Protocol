//! Sponsorship settings endpoints.
//!
//! GET  /v1/wallets/:id/sponsorship — read current config (or defaults if no row yet).
//! PUT  /v1/wallets/:id/sponsorship — create or update config; validates fee constraints.

use crate::error::{ApiError, ApiResult, Envelope};
use crate::json::parse_optional;
use crate::state::AppState;
use axum::body::Bytes;
use axum::extract::{Path, State};
use axum::http::HeaderMap;
use axum::Json;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

const DEFAULT_ENABLED: bool = false;
const DEFAULT_MAX_FEE: i64 = 1_000_000;
const DEFAULT_DAILY_BUDGET: i64 = 100_000_000;

#[derive(Debug, Serialize)]
pub struct SponsorshipResponse {
    pub wallet_id: Uuid,
    pub enabled: bool,
    pub max_fee_per_tx_stroops: i64,
    pub daily_budget_stroops: i64,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Default, Deserialize)]
pub struct UpdateSponsorshipRequest {
    pub enabled: Option<bool>,
    pub max_fee_per_tx_stroops: Option<i64>,
    pub daily_budget_stroops: Option<i64>,
}

/// `GET /v1/wallets/:id/sponsorship`
pub async fn get_sponsorship(
    State(state): State<AppState>,
    Path(wallet_id): Path<Uuid>,
    headers: HeaderMap,
) -> ApiResult<Json<Envelope<SponsorshipResponse>>> {
    let user_id = crate::auth::require_login(&headers, &state)?;
    let wallet = state.store().get_wallet(wallet_id).await?;
    if wallet.user_id != Some(user_id) {
        return Err(ApiError::NotFound);
    }

    let resp = match state.store().get_sponsorship_config(wallet_id).await? {
        Some(cfg) => SponsorshipResponse {
            wallet_id: cfg.wallet_id,
            enabled: cfg.enabled,
            max_fee_per_tx_stroops: cfg.max_fee_per_tx_stroops,
            daily_budget_stroops: cfg.daily_budget_stroops,
            created_at: Some(cfg.created_at),
            updated_at: Some(cfg.updated_at),
        },
        None => SponsorshipResponse {
            wallet_id,
            enabled: DEFAULT_ENABLED,
            max_fee_per_tx_stroops: DEFAULT_MAX_FEE,
            daily_budget_stroops: DEFAULT_DAILY_BUDGET,
            created_at: None,
            updated_at: None,
        },
    };

    Ok(Envelope::ok(resp))
}

/// `PUT /v1/wallets/:id/sponsorship`
pub async fn update_sponsorship(
    State(state): State<AppState>,
    Path(wallet_id): Path<Uuid>,
    headers: HeaderMap,
    body: Bytes,
) -> ApiResult<Json<Envelope<SponsorshipResponse>>> {
    let user_id = crate::auth::require_login(&headers, &state)?;
    let wallet = state.store().get_wallet(wallet_id).await?;
    if wallet.user_id != Some(user_id) {
        return Err(ApiError::NotFound);
    }

    let req: UpdateSponsorshipRequest = parse_optional(&body)?;

    // Merge with existing config or defaults.
    let existing = state.store().get_sponsorship_config(wallet_id).await?;
    let (cur_enabled, cur_max_fee, cur_budget) = match &existing {
        Some(c) => (c.enabled, c.max_fee_per_tx_stroops, c.daily_budget_stroops),
        None => (DEFAULT_ENABLED, DEFAULT_MAX_FEE, DEFAULT_DAILY_BUDGET),
    };

    let enabled = req.enabled.unwrap_or(cur_enabled);
    let max_fee = req.max_fee_per_tx_stroops.unwrap_or(cur_max_fee);
    let budget = req.daily_budget_stroops.unwrap_or(cur_budget);

    // Validate amounts.
    if max_fee <= 0 {
        return Err(ApiError::BadRequest(
            "max_fee_per_tx_stroops must be > 0".into(),
        ));
    }
    if budget < max_fee {
        return Err(ApiError::BadRequest(
            "daily_budget_stroops must be >= max_fee_per_tx_stroops".into(),
        ));
    }

    let cfg = state
        .store()
        .upsert_sponsorship_config(wallet_id, enabled, max_fee, budget)
        .await?;

    crate::audit::record(
        &state,
        user_id,
        "updated sponsorship config",
        crate::audit::category::SPONSORSHIP,
        Some(&wallet_id.to_string()),
        &headers,
    )
    .await;

    Ok(Envelope::ok(SponsorshipResponse {
        wallet_id: cfg.wallet_id,
        enabled: cfg.enabled,
        max_fee_per_tx_stroops: cfg.max_fee_per_tx_stroops,
        daily_budget_stroops: cfg.daily_budget_stroops,
        created_at: Some(cfg.created_at),
        updated_at: Some(cfg.updated_at),
    }))
}
