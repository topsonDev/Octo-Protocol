//! HMAC-SHA256 signing of webhook payloads.
//!
//! Each delivery is signed with the endpoint's secret over the exact bytes of the JSON body. The
//! signature is sent in the `X-Octo-Signature` header as lowercase hex. Consumers recompute the
//! HMAC over the received body and compare in constant time to authenticate the webhook.

use hmac::{Hmac, Mac};
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

/// The HTTP header carrying the signature.
pub const SIGNATURE_HEADER: &str = "X-Octo-Signature";

/// Compute the lowercase-hex HMAC-SHA256 of `body` under `secret`.
pub fn sign(secret: &[u8], body: &[u8]) -> String {
    // `new_from_slice` accepts any key length and never errors for HMAC.
    let mut mac = <HmacSha256 as Mac>::new_from_slice(secret).expect("HMAC accepts any key length");
    mac.update(body);
    hex::encode(mac.finalize().into_bytes())
}

/// Verify a hex signature against `body` using a constant-time comparison.
pub fn verify(secret: &[u8], body: &[u8], signature_hex: &str) -> bool {
    let Ok(sig) = hex::decode(signature_hex) else {
        return false;
    };
    let mut mac = <HmacSha256 as Mac>::new_from_slice(secret).expect("HMAC accepts any key length");
    mac.update(body);
    mac.verify_slice(&sig).is_ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sign_then_verify_roundtrips() {
        let secret = b"shh-secret";
        let body = br#"{"event":"deposit.created","amount":"5"}"#;
        let sig = sign(secret, body);
        assert!(verify(secret, body, &sig));
    }

    #[test]
    fn tampered_body_fails_verification() {
        let secret = b"shh-secret";
        let sig = sign(secret, b"original");
        assert!(!verify(secret, b"tampered", &sig));
    }

    #[test]
    fn wrong_secret_fails_verification() {
        let sig = sign(b"key-a", b"body");
        assert!(!verify(b"key-b", b"body", &sig));
    }

    #[test]
    fn garbage_signature_is_rejected() {
        assert!(!verify(b"k", b"body", "not-hex"));
        assert!(!verify(b"k", b"body", "00"));
    }
}
