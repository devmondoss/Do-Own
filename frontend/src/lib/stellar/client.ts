// Browser side of the Do-Own wallet. The keypair is generated and kept on the
// person's device (non-custodial). The Do-Own server never receives the secret:
// it only co-signs as sponsor (reserves) or fee payer (fee-bump).
// The SDK is loaded lazily so the first screen stays light on mobile.
import type { DecisionRecord } from "@/types/do-own";
import {
  HORIZON_URL,
  NETWORK_PASSPHRASE,
  REWARD_ASSET_CODE,
  explorerTx,
  type PublicStellarConfig,
} from "./config";

const sdk = () => import("@stellar/stellar-sdk");
const WALLET_KEY = "do-own.wallet.v1";

export interface StoredWallet {
  secret: string;
  createdAt: string;
}

export interface WalletPayment {
  id: string;
  hash: string;
  direction: "in" | "out";
  amount: string;
  counterparty: string;
  createdAt: string;
  fromSponsor: boolean;
}

export interface SealReceipt {
  root: string; // hex, 32 bytes — what goes in the memo hash
  transactionHash: string;
  explorerUrl: string;
  createdAt: string;
  records: number;
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode: the wallet lives only for this session */
  }
}

export function loadStoredWallet(): StoredWallet | null {
  const raw = readStorage(WALLET_KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as StoredWallet;
    return typeof value.secret === "string" ? value : null;
  } catch {
    return null;
  }
}

export async function createWallet(): Promise<StoredWallet> {
  const { Keypair } = await sdk();
  const wallet = {
    secret: Keypair.random().secret(),
    createdAt: new Date().toISOString(),
  };
  writeStorage(WALLET_KEY, JSON.stringify(wallet));
  return wallet;
}

export async function importWallet(secret: string): Promise<StoredWallet> {
  const { StrKey } = await sdk();
  const clean = secret.trim().toUpperCase();
  if (!StrKey.isValidEd25519SecretSeed(clean))
    throw new Error("La clave de respaldo no es válida.");
  const wallet = { secret: clean, createdAt: new Date().toISOString() };
  writeStorage(WALLET_KEY, JSON.stringify(wallet));
  return wallet;
}

export async function publicKeyOf(wallet: StoredWallet) {
  const { Keypair } = await sdk();
  return Keypair.fromSecret(wallet.secret).publicKey();
}

export async function isValidAccountId(value: string) {
  const { StrKey } = await sdk();
  return StrKey.isValidEd25519PublicKey(value.trim());
}

export async function fetchConfig(): Promise<PublicStellarConfig | null> {
  try {
    const response = await fetch("/api/stellar/config", { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as PublicStellarConfig;
  } catch {
    return null;
  }
}

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      (data as { error?: string }).error ||
        "No pudimos completar la operación. Intenta de nuevo.",
    );
  return data as T;
}

async function horizon() {
  const { Horizon } = await sdk();
  return new Horizon.Server(HORIZON_URL);
}

export interface AccountState {
  exists: boolean;
  ready: boolean;
  balance: string;
}

export async function getAccountState(
  publicKey: string,
  config: PublicStellarConfig,
): Promise<AccountState> {
  const server = await horizon();
  try {
    const account = await server.loadAccount(publicKey);
    const line = account.balances.find(
      (b) =>
        "asset_code" in b &&
        b.asset_code === REWARD_ASSET_CODE &&
        b.asset_issuer === config.asset?.issuer,
    );
    return { exists: true, ready: !!line, balance: line?.balance ?? "0" };
  } catch (error) {
    if ((error as { response?: { status?: number } }).response?.status === 404)
      return { exists: false, ready: false, balance: "0" };
    throw error;
  }
}

/** Creates the account with sponsored reserves. Returns the transaction hash,
 * or null when the account was already ready. */
export async function onboard(wallet: StoredWallet): Promise<string | null> {
  const { Keypair, TransactionBuilder } = await sdk();
  const keypair = Keypair.fromSecret(wallet.secret);
  const result = await postJson<{ status: "ready" | "sign"; xdr?: string }>(
    "/api/stellar/onboard",
    { publicKey: keypair.publicKey() },
  );
  if (result.status === "ready" || !result.xdr) return null;
  const tx = TransactionBuilder.fromXDR(result.xdr, NETWORK_PASSPHRASE);
  tx.sign(keypair);
  const server = await horizon();
  const submitted = await server.submitTransaction(tx);
  return submitted.hash;
}

export interface RewardResult {
  status: "confirmed";
  amount: string;
  asset: { code: string; issuer: string };
  transactionHash: string;
  explorerUrl: string;
  createdAt: string;
}

export function claimReward(publicKey: string, rewardId: string) {
  return postJson<RewardResult>("/api/stellar/reward", { publicKey, rewardId });
}

interface SponsoredResult {
  status: "confirmed";
  transactionHash: string;
  explorerUrl: string;
  createdAt: string;
}

export async function sendDown(
  wallet: StoredWallet,
  config: PublicStellarConfig,
  destination: string,
  amount: string,
) {
  const { Asset, BASE_FEE, Keypair, Memo, Operation, TransactionBuilder } =
    await sdk();
  if (!config.asset) throw new Error("Recompensas no configuradas.");
  const destState = await getAccountState(destination, config);
  if (!destState.ready)
    throw new Error(
      "Esa cuenta todavía no puede recibir recompensas de Do-Own.",
    );
  const keypair = Keypair.fromSecret(wallet.secret);
  const server = await horizon();
  const account = await server.loadAccount(keypair.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: new Asset(config.asset.code, config.asset.issuer),
        amount,
      }),
    )
    .addMemo(Memo.text("Do-Own: envio"))
    .setTimeout(120)
    .build();
  tx.sign(keypair);
  return postJson<SponsoredResult>("/api/stellar/sponsor", {
    xdr: tx.toXDR(),
    kind: "transfer",
  });
}

// ---------- Weekly seal (salted commitments + Merkle root) ----------

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
export const fromHex = (hex: string) =>
  new Uint8Array(hex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));

async function sha256(...parts: Uint8Array[]) {
  const length = parts.reduce((sum, p) => sum + p.length, 0);
  const joined = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    joined.set(part, offset);
    offset += part.length;
  }
  return new Uint8Array(await crypto.subtle.digest("SHA-256", joined));
}

/** Canonical serialization of a record. Order of keys is fixed (v1). */
function canonical(record: DecisionRecord) {
  return JSON.stringify([
    "do-own:record:v1",
    record.id,
    record.createdAt,
    record.amount,
    record.currency,
    record.category,
    record.emotion,
    record.note,
  ]);
}

export interface SealedRecord {
  id: string;
  salt: string; // hex — kept on the device, never published
  commitment: string; // hex
}

/** sha256(salt ‖ record). The random salt prevents guessing "50 MXN tacos"
 * from the published hash (Propuesta v2.1, decisión técnica 2). */
export async function commitRecords(records: DecisionRecord[]) {
  const encoder = new TextEncoder();
  const sealed: SealedRecord[] = [];
  for (const record of records) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const commitment = await sha256(salt, encoder.encode(canonical(record)));
    sealed.push({
      id: record.id,
      salt: toHex(salt),
      commitment: toHex(commitment),
    });
  }
  return sealed;
}

export async function recomputeCommitment(
  record: DecisionRecord,
  saltHex: string,
) {
  const commitment = await sha256(
    fromHex(saltHex),
    new TextEncoder().encode(canonical(record)),
  );
  return toHex(commitment);
}

/** Binary Merkle tree over the commitments (odd node is promoted). */
export async function merkleRoot(commitmentsHex: string[]) {
  if (commitmentsHex.length === 0) throw new Error("No hay registros.");
  let level: Uint8Array[] = commitmentsHex.map(fromHex);
  while (level.length > 1) {
    const next: Uint8Array[] = [];
    for (let i = 0; i < level.length; i += 2)
      next.push(
        i + 1 < level.length ? await sha256(level[i], level[i + 1]) : level[i],
      );
    level = next;
  }
  return toHex(level[0]);
}

/** Anchors the weekly root: the user signs a no-op transaction with the root
 * as memo hash; Do-Own pays the fee with a fee-bump. */
export async function anchorRoot(wallet: StoredWallet, rootHex: string) {
  const { BASE_FEE, Keypair, Memo, Operation, TransactionBuilder } =
    await sdk();
  const keypair = Keypair.fromSecret(wallet.secret);
  const server = await horizon();
  const account = await server.loadAccount(keypair.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.bumpSequence({ bumpTo: "0" }))
    .addMemo(Memo.hash(rootHex))
    .setTimeout(120)
    .build();
  tx.sign(keypair);
  return postJson<SponsoredResult>("/api/stellar/sponsor", {
    xdr: tx.toXDR(),
    kind: "seal",
  });
}

/** Reads the transaction from the public network and checks that its memo hash
 * equals the expected root. Anyone can repeat this check on the explorer. */
export async function verifyAnchor(transactionHash: string, rootHex: string) {
  const response = await fetch(
    `${HORIZON_URL}/transactions/${transactionHash}`,
  );
  if (!response.ok) throw new Error("No encontramos la operación en la red.");
  const tx = (await response.json()) as {
    memo_type: string;
    memo?: string;
    successful: boolean;
    ledger: number;
    created_at: string;
    source_account: string;
  };
  const memoHex =
    tx.memo_type === "hash" && tx.memo
      ? toHex(Uint8Array.from(atob(tx.memo), (c) => c.charCodeAt(0)))
      : null;
  return {
    matches: tx.successful && memoHex === rootHex,
    ledger: tx.ledger,
    createdAt: tx.created_at,
    account: tx.source_account,
    explorerUrl: explorerTx(transactionHash),
  };
}

export async function getPayments(
  publicKey: string,
  config: PublicStellarConfig,
): Promise<WalletPayment[]> {
  const response = await fetch(
    `${HORIZON_URL}/accounts/${publicKey}/payments?order=desc&limit=20`,
  );
  if (!response.ok) return [];
  const data = (await response.json()) as {
    _embedded: {
      records: {
        id: string;
        type: string;
        transaction_hash: string;
        from?: string;
        to?: string;
        amount?: string;
        asset_code?: string;
        asset_issuer?: string;
        created_at: string;
      }[];
    };
  };
  return data._embedded.records
    .filter(
      (r) =>
        r.type === "payment" &&
        r.asset_code === REWARD_ASSET_CODE &&
        r.asset_issuer === config.asset?.issuer,
    )
    .map((r) => ({
      id: r.id,
      hash: r.transaction_hash,
      direction: r.to === publicKey ? ("in" as const) : ("out" as const),
      amount: r.amount ?? "0",
      counterparty: (r.to === publicKey ? r.from : r.to) ?? "",
      createdAt: r.created_at,
      fromSponsor: r.from === config.sponsor,
    }));
}

export const shortId = (id: string) => `${id.slice(0, 5)}…${id.slice(-5)}`;
