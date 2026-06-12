//! Minimal Horizon + friendbot client used by the API for funding and balance reads.
//!
//! Only the few endpoints octo needs are implemented. Network errors map to `ApiError::Internal`
//! (logged by the caller); a missing account maps to `ApiError::NotFound`.

use crate::error::ApiError;
use serde::{Deserialize, Serialize};

/// A single balance line from a Horizon account.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Balance {
    /// Decimal string, e.g. "100.0000000".
    pub balance: String,
    /// "native" for XLM, else "credit_alphanum4" / "credit_alphanum12".
    pub asset_type: String,
    #[serde(default)]
    pub asset_code: Option<String>,
    #[serde(default)]
    pub asset_issuer: Option<String>,
}

#[derive(Debug, Deserialize)]
struct AccountResponse {
    balances: Vec<Balance>,
    /// Account sequence number (Horizon returns it as a string).
    #[serde(default)]
    sequence: String,
}

/// The result of submitting a transaction to Horizon.
#[derive(Debug, Clone)]
pub struct SubmitResult {
    pub hash: String,
    pub successful: bool,
    pub ledger: Option<i64>,
}

#[derive(Debug, Deserialize)]
struct SubmitResponse {
    hash: String,
    #[serde(default)]
    successful: bool,
    #[serde(default)]
    ledger: Option<i64>,
}

/// A thin Horizon client (one shared reqwest client).
#[derive(Clone)]
pub struct Horizon {
    http: reqwest::Client,
    base_url: String,
}

impl Horizon {
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            http: reqwest::Client::new(),
            base_url: base_url.into(),
        }
    }

    /// Fetch an account's balances. Returns `NotFound` if the account does not exist on-chain yet.
    pub async fn balances(&self, account_g: &str) -> Result<Vec<Balance>, ApiError> {
        let url = format!(
            "{}/accounts/{}",
            self.base_url.trim_end_matches('/'),
            account_g
        );
        let resp = self
            .http
            .get(&url)
            .send()
            .await
            .map_err(|_| ApiError::Internal)?;

        if resp.status() == reqwest::StatusCode::NOT_FOUND {
            return Err(ApiError::NotFound);
        }
        if !resp.status().is_success() {
            return Err(ApiError::Internal);
        }
        let account: AccountResponse = resp.json().await.map_err(|_| ApiError::Internal)?;
        Ok(account.balances)
    }

    /// Fetch an account's current sequence number. `NotFound` if the account doesn't exist.
    pub async fn account_sequence(&self, account_g: &str) -> Result<i64, ApiError> {
        let url = format!(
            "{}/accounts/{}",
            self.base_url.trim_end_matches('/'),
            account_g
        );
        let resp = self
            .http
            .get(&url)
            .send()
            .await
            .map_err(|_| ApiError::Internal)?;
        if resp.status() == reqwest::StatusCode::NOT_FOUND {
            return Err(ApiError::NotFound);
        }
        if !resp.status().is_success() {
            return Err(ApiError::Internal);
        }
        let account: AccountResponse = resp.json().await.map_err(|_| ApiError::Internal)?;
        account
            .sequence
            .parse::<i64>()
            .map_err(|_| ApiError::Internal)
    }

    /// Submit a signed transaction (base64 XDR envelope) to Horizon.
    ///
    /// Returns the result even when the transaction failed on-chain (`successful == false`) so the
    /// caller can record the failure; only transport/HTTP errors return `Err`.
    pub async fn submit_transaction(&self, envelope_xdr: &str) -> Result<SubmitResult, ApiError> {
        let url = format!("{}/transactions", self.base_url.trim_end_matches('/'));
        let resp = self
            .http
            .post(&url)
            .form(&[("tx", envelope_xdr)])
            .send()
            .await
            .map_err(|_| ApiError::Internal)?;

        // Horizon returns 400 with a problem document when the tx is rejected (e.g. bad seq, no
        // balance). Treat a parseable hash as "submitted but failed"; otherwise it's an error.
        let status = resp.status();
        let body: SubmitResponse = match resp.json().await {
            Ok(b) => b,
            Err(_) => {
                if status.is_success() {
                    return Err(ApiError::Internal);
                }
                // Rejected with no parseable hash → surface as a bad-request to the caller.
                return Err(ApiError::BadRequest(
                    "transaction rejected by network".into(),
                ));
            }
        };
        Ok(SubmitResult {
            hash: body.hash,
            successful: body.successful,
            ledger: body.ledger,
        })
    }
}

/// Fund a testnet account via friendbot. Best-effort: returns `Ok(())` on success, and a logged
/// error otherwise (the caller decides whether funding is required).
pub async fn friendbot_fund(friendbot_url: &str, account_g: &str) -> Result<(), ApiError> {
    let url = format!(
        "{}/?addr={}",
        friendbot_url.trim_end_matches('/'),
        account_g
    );
    let resp = reqwest::Client::new()
        .get(&url)
        .send()
        .await
        .map_err(|_| ApiError::Internal)?;
    if resp.status().is_success() {
        Ok(())
    } else {
        Err(ApiError::Internal)
    }
}
