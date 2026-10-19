// Shared, non-secret Stellar settings. Safe to import from client and server.
export const STELLAR_NETWORK = "testnet" as const;
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
export const EXPLORER_BASE = "https://stellar.expert/explorer/testnet";
export const REWARD_ASSET_CODE = "DOWN";
/** Units of DOWN sent per validated action (registro o microlección). */
export const REWARD_AMOUNT = "1";

export interface PublicStellarConfig {
  enabled: boolean;
  network: typeof STELLAR_NETWORK;
  horizonUrl: string;
  networkPassphrase: string;
  explorerBase: string;
  asset: { code: string; issuer: string } | null;
  sponsor: string | null;
}

export const explorerTx = (hash: string) => `${EXPLORER_BASE}/tx/${hash}`;
export const explorerAccount = (id: string) => `${EXPLORER_BASE}/account/${id}`;
