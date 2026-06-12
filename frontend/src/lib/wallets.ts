/** Wallet API calls + types, mirroring the octo backend. */

"use client";

import { apiFetch } from "./api";

export type CreateWalletResponse = {
  id: string;
  network: string;
  address: string;
  recovery_mnemonic: string;
  funded: boolean;
};

export type WalletView = {
  id: string;
  network: string;
  address: string;
  label: string | null;
  description: string | null;
};

export type Balance = {
  balance: string;
  asset_type: string;
  asset_code?: string | null;
  asset_issuer?: string | null;
};

/** Create a master wallet. The server picks the network; name/description optional. */
export function createWallet(
  token: string,
  label?: string,
  description?: string,
) {
  return apiFetch<CreateWalletResponse>("/v1/wallets", {
    method: "POST",
    token,
    body: JSON.stringify({
      label: label || null,
      description: description || null,
    }),
  });
}

/** List the authenticated user's wallets. */
export function listWallets(token: string) {
  return apiFetch<WalletView[]>("/v1/wallets", { token });
}

export function getWallet(token: string, id: string) {
  return apiFetch<WalletView>(`/v1/wallets/${id}`, { token });
}

export function getBalances(token: string, id: string) {
  return apiFetch<Balance[]>(`/v1/wallets/${id}/balances`, { token });
}
