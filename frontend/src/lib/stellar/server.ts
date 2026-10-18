// Server-only Stellar helpers. Imported exclusively by route handlers in
// src/app/api/stellar. Never import this file from a client component: it reads
// STELLAR_SPONSOR_SECRET, the key that pays fees and sponsors reserves.
import { createHash } from "node:crypto";
import {
  Asset,
  BASE_FEE,
  FeeBumpTransaction,
  Horizon,
  Keypair,
  Memo,
  Operation,
  StrKey,
  Transaction,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import {
  HORIZON_URL,
  NETWORK_PASSPHRASE,
  REWARD_AMOUNT,
  REWARD_ASSET_CODE,
  STELLAR_NETWORK,
  explorerTx,
  type PublicStellarConfig,
} from "./config";

export class StellarApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

const horizon = new Horizon.Server(HORIZON_URL);

function env() {
  const secret = process.env.STELLAR_SPONSOR_SECRET?.trim();
  const issuer = process.env.STELLAR_ASSET_ISSUER?.trim();
  if (!secret || !issuer) return null;
  if (!StrKey.isValidEd25519SecretSeed(secret))
    throw new StellarApiError("STELLAR_SPONSOR_SECRET inválida", 500);
  if (!StrKey.isValidEd25519PublicKey(issuer))
    throw new StellarApiError("STELLAR_ASSET_ISSUER inválido", 500);
  return {
    sponsor: Keypair.fromSecret(secret),
    asset: new Asset(REWARD_ASSET_CODE, issuer),
    issuer,
  };
}

function requireEnv() {
  const value = env();
  if (!value)
    throw new StellarApiError(
      "La integración con la red no está configurada en este servidor.",
      503,
    );
  return value;
}

export function publicConfig(): PublicStellarConfig {
  const value = env();
  return {
    enabled: !!value,
    network: STELLAR_NETWORK,
    horizonUrl: HORIZON_URL,
    networkPassphrase: NETWORK_PASSPHRASE,
    explorerBase: "https://stellar.expert/explorer/testnet",
    asset: value ? { code: REWARD_ASSET_CODE, issuer: value.issuer } : null,
    sponsor: value ? value.sponsor.publicKey() : null,
  };
}

export function assertPublicKey(value: unknown): string {
  if (typeof value !== "string" || !StrKey.isValidEd25519PublicKey(value))
    throw new StellarApiError("Cuenta inválida.");
  return value;
}

async function loadAccount(id: string) {
  try {
    return await horizon.loadAccount(id);
  } catch (error) {
    if ((error as { response?: { status?: number } }).response?.status === 404)
      return null;
    throw error;
  }
}

function hasTrustline(account: Horizon.AccountResponse, asset: Asset) {
  return account.balances.some(
    (b) =>
      "asset_code" in b &&
      b.asset_code === asset.getCode() &&
      b.asset_issuer === asset.getIssuer(),
  );
}

/**
 * Step 1 of onboarding. Returns a transaction that creates the user's account
 * with 0 XLM and a DOWN trustline. The sponsor pays the fee and sponsors both
 * reserves (account + trustline), so the user never needs to buy XLM.
 * The sponsor signs here; the user's device adds its signature and submits.
 */
export async function buildOnboarding(publicKey: string) {
  const { sponsor, asset } = requireEnv();
  const existing = await loadAccount(publicKey);
  if (existing && hasTrustline(existing, asset))
    return { status: "ready" as const };
  if (existing)
    throw new StellarApiError(
      "La cuenta ya existe pero no acepta recompensas. Usa una cuenta nueva.",
      409,
    );
  const sponsorAccount = await horizon.loadAccount(sponsor.publicKey());
  const tx = new TransactionBuilder(sponsorAccount, {
    fee: String(Number(BASE_FEE) * 2),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.beginSponsoringFutureReserves({ sponsoredId: publicKey }),
    )
    .addOperation(
      Operation.createAccount({ destination: publicKey, startingBalance: "0" }),
    )
    .addOperation(Operation.changeTrust({ asset, source: publicKey }))
    .addOperation(Operation.endSponsoringFutureReserves({ source: publicKey }))
    .addMemo(Memo.text("Do-Own: cuenta"))
    .setTimeout(180)
    .build();
  tx.sign(sponsor);
  return { status: "sign" as const, xdr: tx.toXDR() };
}

/** Deterministic memo for a reward: lets the server detect duplicates on-chain
 * without storing anything, and reveals nothing about the user's records. */
function rewardMemo(publicKey: string, rewardId: string) {
  return createHash("sha256")
    .update(`do-own:reward:v1:${publicKey}:${rewardId}`)
    .digest();
}

const REWARD_ID = /^(record-[0-9a-f-]{36}|lesson-[a-z0-9-]{1,40})$/;
const MAX_REWARDS_PER_DAY = 12;

/**
 * Sends DOWN from the sponsor (treasury) to the user. Idempotent: if a payment
 * with the same memo hash already exists, returns that transaction instead.
 * TODO(BACKEND): once there is a database and session, validate eligibility
 * (the decision/lesson really exists for this user) before paying.
 */
export async function sendReward(publicKey: string, rewardId: unknown) {
  const { sponsor, asset } = requireEnv();
  if (typeof rewardId !== "string" || !REWARD_ID.test(rewardId))
    throw new StellarApiError("Recompensa inválida.");
  const account = await loadAccount(publicKey);
  if (!account || !hasTrustline(account, asset))
    throw new StellarApiError("La cuenta aún no está lista.", 409);

  const memo = rewardMemo(publicKey, rewardId);
  const memoB64 = memo.toString("base64");
  const page = await horizon
    .transactions()
    .forAccount(publicKey)
    .order("desc")
    .limit(100)
    .call();
  const duplicate = page.records.find(
    (t) => t.memo_type === "hash" && t.memo === memoB64,
  );
  if (duplicate)
    return receipt(duplicate.hash, "confirmed", asset, duplicate.created_at);
  const today = new Date().toISOString().slice(0, 10);
  const todayRewards = page.records.filter(
    (t) =>
      t.source_account === sponsor.publicKey() &&
      t.memo_type === "hash" &&
      t.created_at.startsWith(today),
  ).length;
  if (todayRewards >= MAX_REWARDS_PER_DAY)
    throw new StellarApiError(
      "Alcanzaste el límite de recompensas de hoy.",
      429,
    );

  const sponsorAccount = await horizon.loadAccount(sponsor.publicKey());
  const tx = new TransactionBuilder(sponsorAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: publicKey,
        asset,
        amount: REWARD_AMOUNT,
      }),
    )
    .addMemo(Memo.hash(memo))
    .setTimeout(120)
    .build();
  tx.sign(sponsor);
  const result = await submit(tx);
  return receipt(result.hash, "confirmed", asset, new Date().toISOString());
}

function receipt(
  hash: string,
  status: "confirmed",
  asset: Asset,
  createdAt: string,
) {
  return {
    status,
    amount: REWARD_AMOUNT,
    asset: { code: REWARD_ASSET_CODE, issuer: asset.getIssuer() ?? "" },
    transactionHash: hash,
    explorerUrl: explorerTx(hash),
    createdAt,
  };
}

/**
 * Fee sponsorship. The user signs a transaction from their own account (0 XLM)
 * and the sponsor wraps it in a fee-bump, paying the fee. To avoid draining the
 * sponsor, only two shapes are accepted:
 *  - "seal": one no-op bumpSequence + memo hash (the weekly Merkle root).
 *  - "transfer": one DOWN payment to another account.
 */
export async function feeBumpAndSubmit(xdr: unknown, kind: unknown) {
  const { sponsor, asset } = requireEnv();
  if (typeof xdr !== "string" || xdr.length > 4000)
    throw new StellarApiError("Transacción inválida.");
  if (kind !== "seal" && kind !== "transfer")
    throw new StellarApiError("Tipo de operación no permitido.");
  let inner: Transaction;
  try {
    const parsed = TransactionBuilder.fromXDR(xdr, NETWORK_PASSPHRASE);
    if (parsed instanceof FeeBumpTransaction) throw new Error();
    inner = parsed;
  } catch {
    throw new StellarApiError("Transacción inválida.");
  }
  if (inner.source === sponsor.publicKey())
    throw new StellarApiError("Origen no permitido.");
  if (inner.operations.length !== 1 || inner.signatures.length !== 1)
    throw new StellarApiError("La operación no tiene la forma esperada.");
  const op = inner.operations[0];
  if (op.source && op.source !== inner.source)
    throw new StellarApiError("Origen no permitido.");

  if (kind === "seal") {
    if (op.type !== "bumpSequence" || op.bumpTo !== "0")
      throw new StellarApiError("El sello no tiene la forma esperada.");
    if (inner.memo.type !== "hash")
      throw new StellarApiError("El sello necesita un memo hash.");
  } else {
    if (
      op.type !== "payment" ||
      !op.asset.equals(asset) ||
      op.destination === inner.source
    )
      throw new StellarApiError("Solo se pueden enviar recompensas DOWN.");
  }
  // Inner signature must belong to the inner source account.
  const kp = Keypair.fromPublicKey(inner.source);
  if (
    !kp.verify(inner.hash(), Buffer.from(inner.signatures[0].signature.value))
  )
    throw new StellarApiError("Firma inválida.");
  const account = await loadAccount(inner.source);
  if (!account || !hasTrustline(account, asset))
    throw new StellarApiError("La cuenta no pertenece a Do-Own.", 403);

  const bump = TransactionBuilder.buildFeeBumpTransaction(
    sponsor,
    String(Number(BASE_FEE) * 2),
    inner,
    NETWORK_PASSPHRASE,
  );
  bump.sign(sponsor);
  const result = await submit(bump);
  return {
    status: "confirmed" as const,
    transactionHash: result.hash,
    explorerUrl: explorerTx(result.hash),
    ledger: result.ledger,
    createdAt: new Date().toISOString(),
  };
}

async function submit(tx: Transaction | FeeBumpTransaction) {
  try {
    return await horizon.submitTransaction(tx);
  } catch (error) {
    const codes = (
      error as {
        response?: { data?: { extras?: { result_codes?: unknown } } };
      }
    ).response?.data?.extras?.result_codes;
    console.error("[stellar] submit failed", JSON.stringify(codes ?? null));
    throw new StellarApiError(
      "La red no aceptó la operación. Intenta de nuevo en unos segundos.",
      502,
    );
  }
}
