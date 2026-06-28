/** Sponsorship API calls + types. */

import { apiFetch } from "./api";

export type SponsorshipConfig = {
  wallet_id: string;
  enabled: boolean;
  max_fee_per_tx_stroops: number;
  daily_budget_stroops: number;
  created_at: string | null;
  updated_at: string | null;
  /** Not yet returned by the API; reserved for future consumption tracking. */
  fees_spent_today_stroops?: number;
};

/** Fetch the sponsorship config for a wallet (JWT login token required). */
export function getSponsorshipConfig(token: string, walletId: string) {
  return apiFetch<SponsorshipConfig>(
    `/v1/wallets/${walletId}/sponsorship`,
    { token },
  );
}
