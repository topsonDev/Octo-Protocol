//! Horizon payment streaming with a durable cursor. Attributes deposits to a customer by the
//! destination muxed id or the transaction memo id, records them, and triggers webhooks.
//!
//! Implemented in Step 8 of the project plan.
#![forbid(unsafe_code)]
