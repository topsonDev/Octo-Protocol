//! Sponsored transaction history endpoint.

use crate::error::{ApiError, ApiResult, Envelope};
use crate::state::AppState;
use axum::extract::{Path, Query, State};
use axum::http::HeaderMap;
use axum::Json;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct SponsoredTxnQuery {
    /// Maximum rows to return (default 50, max 200).
    pub limit: Option<i64>,
    /// Filter by status: pending | confirmed | failed.
    pub status: Option<String>,
    /// Cursor: return rows created before this id.
    pub before: Option<Uuid>,
}

#[derive(Debug, Serialize)]
pub struct SponsoredTxnListResponse {
    pub data: Vec<octo_store::SponsoredTransaction>,
    /// UUID of the last row in this page, or null if there are no more rows.
    pub next_cursor: Option<Uuid>,
}

/// `GET /v1/wallets/:id/sponsored-transactions`
pub async fn list_sponsored_transactions(
    State(state): State<AppState>,
    Path(wallet_id): Path<Uuid>,
    headers: HeaderMap,
    Query(q): Query<SponsoredTxnQuery>,
) -> ApiResult<Json<Envelope<SponsoredTxnListResponse>>> {
    // JWT login session required (no API keys).
    let user_id = crate::auth::require_login(&headers, &state)?;
    let wallet = state.store().get_wallet(wallet_id).await?;
    if wallet.user_id != Some(user_id) {
        return Err(ApiError::NotFound);
    }

    let limit = q.limit.unwrap_or(50);
    if limit > 200 {
        return Err(ApiError::BadRequest("limit must not exceed 200".into()));
    }
    if limit < 1 {
        return Err(ApiError::BadRequest("limit must be at least 1".into()));
    }

    let status = q.status.filter(|s| !s.is_empty());
    if let Some(ref s) = status {
        if !matches!(s.as_str(), "pending" | "confirmed" | "failed") {
            return Err(ApiError::BadRequest(
                "status must be one of: pending, confirmed, failed".into(),
            ));
        }
    }

    // Fetch limit+1 to detect if there are more rows.
    let rows = state
        .store()
        .list_sponsored_transactions(wallet_id, limit + 1, status.as_deref(), q.before)
        .await?;

    let has_more = rows.len() > limit as usize;
    let mut data = rows;
    let next_cursor = if has_more {
        let last = data.pop().expect("extra row exists");
        Some(last.id)
    } else {
        None
    };

    Ok(Envelope::ok(SponsoredTxnListResponse { data, next_cursor }))
}
