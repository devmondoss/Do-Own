// One-time setup and evidence generation that run on the server (Vercel), so
// nobody needs Node or Git locally. Protected by STELLAR_ADMIN_TOKEN.
// Testnet only: funds accounts with Friendbot.
import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Memo,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { HORIZON_URL, NETWORK_PASSPHRASE, REWARD_ASSET_CODE } from "./config";
import {
  StellarApiError,
  buildOnboarding,
  feeBumpAndSubmit,
  publicConfig,
  sendReward,
} from "./server";

const horizon = new Horizon.Server(HORIZON_URL);
const EXPLORER = "https://stellar.expert/explorer/testnet";
const SUPPLY = "1000000";

export function assertAdmin(token: string | null) {
  const expected = process.env.STELLAR_ADMIN_TOKEN?.trim();
  if (!expected || !token) throw new StellarApiError("No autorizado.", 401);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b))
    throw new StellarApiError("No autorizado.", 401);
}

async function exists(id: string) {
  try {
    return await horizon.loadAccount(id);
  } catch {
    return null;
  }
}

async function fund(id: string) {
  if (await exists(id)) return "ya existía";
  const res = await fetch(`https://friendbot.stellar.org/?addr=${id}`);
  if (!res.ok)
    throw new StellarApiError(`Friendbot respondió ${res.status}`, 502);
  return "fondeada con Friendbot";
}

/** Creates/funds issuer + sponsor, adds the DOWN trustline and issues supply.
 * Safe to run more than once. */
export async function setupTestnet() {
  const sponsorSecret = process.env.STELLAR_SPONSOR_SECRET?.trim();
  const issuerSecret = process.env.STELLAR_ISSUER_SECRET?.trim();
  if (!sponsorSecret || !issuerSecret)
    throw new StellarApiError(
      "Faltan STELLAR_SPONSOR_SECRET o STELLAR_ISSUER_SECRET.",
      503,
    );
  const sponsor = Keypair.fromSecret(sponsorSecret);
  const issuer = Keypair.fromSecret(issuerSecret);
  if (process.env.STELLAR_ASSET_ISSUER?.trim() !== issuer.publicKey())
    throw new StellarApiError(
      "STELLAR_ASSET_ISSUER no corresponde a STELLAR_ISSUER_SECRET.",
      500,
    );
  const asset = new Asset(REWARD_ASSET_CODE, issuer.publicKey());
  const log: string[] = [];
  log.push(`Emisor: ${await fund(issuer.publicKey())}`);
  log.push(`Patrocinador: ${await fund(sponsor.publicKey())}`);

  let account = await horizon.loadAccount(sponsor.publicKey());
  const line = account.balances.find(
    (b) =>
      "asset_code" in b &&
      b.asset_code === REWARD_ASSET_CODE &&
      b.asset_issuer === issuer.publicKey(),
  );
  const txs: Record<string, string> = {};
  if (!line) {
    const t = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(Operation.changeTrust({ asset }))
      .setTimeout(120)
      .build();
    t.sign(sponsor);
    txs.trustline = (await horizon.submitTransaction(t)).hash;
    log.push("Trustline DOWN creada");
    account = await horizon.loadAccount(sponsor.publicKey());
  }
  const balance = Number(
    account.balances.find(
      (b) => "asset_code" in b && b.asset_code === REWARD_ASSET_CODE,
    )?.balance ?? "0",
  );
  if (balance < 1000) {
    const issuerAccount = await horizon.loadAccount(issuer.publicKey());
    const t = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(Operation.setOptions({ homeDomain: "do-own.vercel.app" }))
      .addOperation(
        Operation.payment({
          destination: sponsor.publicKey(),
          asset,
          amount: SUPPLY,
        }),
      )
      .setTimeout(120)
      .build();
    t.sign(issuer);
    txs.emision = (await horizon.submitTransaction(t)).hash;
    log.push(`Emitidos ${SUPPLY} DOWN a la tesorería`);
  } else log.push(`La tesorería ya tiene ${balance} DOWN`);
  return {
    log,
    issuer: issuer.publicKey(),
    sponsor: sponsor.publicKey(),
    txs,
  };
}

const sha = (...parts: Buffer[]) => {
  const h = createHash("sha256");
  parts.forEach((p) => h.update(p));
  return h.digest();
};

async function onboard(kp: Keypair) {
  const r = await buildOnboarding(kp.publicKey());
  if (r.status !== "sign") throw new StellarApiError("Cuenta ya existía", 500);
  const t = TransactionBuilder.fromXDR(r.xdr, NETWORK_PASSPHRASE);
  t.sign(kp);
  return (await horizon.submitTransaction(t)).hash;
}

async function userTx(
  kp: Keypair,
  op:
    | ReturnType<typeof Operation.payment>
    | ReturnType<typeof Operation.bumpSequence>,
  memo: Memo,
) {
  const account = await horizon.loadAccount(kp.publicKey());
  const t = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(op)
    .addMemo(memo)
    .setTimeout(120)
    .build();
  t.sign(kp);
  return t.toXDR();
}

/** Runs the whole MVP flow with two fresh test users and returns Markdown with
 * explorer links, ready to paste into docs/semana4/EvidenciaTestnet.md. */
export async function runEvidence(origin: string) {
  const config = publicConfig();
  if (!config.enabled || !config.asset || !config.sponsor)
    throw new StellarApiError("Integración no configurada.", 503);
  const asset = new Asset(config.asset.code, config.asset.issuer);
  const tx = (h: string) => `${EXPLORER}/tx/${h}`;
  const acc = (a: string) => `${EXPLORER}/account/${a}`;
  const link = (h: string) => `[${h.slice(0, 10)}…](${tx(h)})`;

  const ana = Keypair.random();
  const beto = Keypair.random();
  const onboardAna = await onboard(ana);
  const onboardBeto = await onboard(beto);

  const rewardId = `record-${randomUUID()}`;
  const reward = await sendReward(ana.publicKey(), rewardId);
  const retry = await sendReward(ana.publicKey(), rewardId);
  const lesson = await sendReward(ana.publicKey(), "lesson-antojo-v1");

  const records = [
    [
      "do-own:record:v1",
      "r1",
      "2026-10-13T16:30:00Z",
      "420.00",
      "MXN",
      "habitual",
      "rutina",
      "Compra de la semana",
    ],
    [
      "do-own:record:v1",
      "r2",
      "2026-10-14T23:00:00Z",
      "60.00",
      "MXN",
      "antojo",
      "estres",
      "Un snack",
    ],
    [
      "do-own:record:v1",
      "r3",
      "2026-10-15T15:00:00Z",
      "150.00",
      "MXN",
      "ahorro",
      "tranquilo",
      "Aparté un poco",
    ],
  ];
  let level: Buffer[] = records.map((r) =>
    sha(randomBytes(16), Buffer.from(JSON.stringify(r))),
  );
  while (level.length > 1) {
    const next: Buffer[] = [];
    for (let i = 0; i < level.length; i += 2)
      next.push(i + 1 < level.length ? sha(level[i], level[i + 1]) : level[i]);
    level = next;
  }
  const root = level[0].toString("hex");
  const seal = await feeBumpAndSubmit(
    await userTx(ana, Operation.bumpSequence({ bumpTo: "0" }), Memo.hash(root)),
    "seal",
  );
  const transfer = await feeBumpAndSubmit(
    await userTx(
      ana,
      Operation.payment({
        destination: beto.publicKey(),
        asset,
        amount: "0.5",
      }),
      Memo.text("Do-Own: envio"),
    ),
    "transfer",
  );

  const onChain = await horizon
    .transactions()
    .transaction(seal.transactionHash)
    .call();
  const verified =
    Buffer.from(onChain.memo ?? "", "base64").toString("hex") === root;
  const anaAccount = await horizon.loadAccount(ana.publicKey());
  const xlm = anaAccount.balances.find(
    (b) => b.asset_type === "native",
  )?.balance;
  const down = anaAccount.balances.find(
    (b) => "asset_code" in b && b.asset_code === REWARD_ASSET_CODE,
  )?.balance;
  const verifyUrl = `${origin}/verificar?tx=${seal.transactionHash}&root=${root}`;

  return `# Evidencia en Stellar Testnet — Do-Own

Generado el ${new Date().toISOString()} en ${origin}. Cada enlace abre la operación real en el explorador público stellar.expert (testnet).

## Infraestructura

| Elemento | Enlace |
|---|---|
| Activo de recompensa DOWN | [DOWN](${EXPLORER}/asset/DOWN-${config.asset.issuer}) |
| Emisor de DOWN | [${config.asset.issuer.slice(0, 8)}…](${acc(config.asset.issuer)}) |
| Patrocinador / tesorería de Do-Own | [${config.sponsor.slice(0, 8)}…](${acc(config.sponsor)}) |

## Flujo del MVP

| # | Paso del producto | Capacidad de Stellar | Transacción |
|---|---|---|---|
| 1 | Se crea la cuenta digital de una persona (saldo 0 XLM) | Reservas patrocinadas (beginSponsoringFutureReserves + createAccount + changeTrust) | ${link(onboardAna)} |
| 2 | Se crea una segunda cuenta | Reservas patrocinadas | ${link(onboardBeto)} |
| 3 | Recompensa por registrar una decisión | Pago de DOWN con memo hash idempotente | ${link(reward.transactionHash)} |
| 4 | Reintento del mismo reclamo (no paga dos veces) | Detección por memo hash | ${retry.transactionHash === reward.transactionHash ? "✅ devolvió la misma transacción" : "⚠️ distinta"} |
| 5 | Recompensa por completar la microlección | Pago de DOWN con memo hash | ${link(lesson.transactionHash)} |
| 6 | Sello semanal de 3 registros (raíz Merkle con sal) | Memo hash firmado por la persona; comisión pagada con fee bump | ${link(seal.transactionHash)} |
| 7 | Envío de 0.5 DOWN a otra persona | Pago firmado por la persona; comisión pagada con fee bump | ${link(transfer.transactionHash)} |

- Cuenta de ejemplo: [${ana.publicKey().slice(0, 8)}…](${acc(ana.publicKey())}) — saldo XLM: **${xlm}**, saldo DOWN: **${down}**.
- Raíz sellada: \`${root}\` — coincide con el memo publicado: **${verified ? "sí" : "no"}**.
- Página pública de verificación: ${verifyUrl}
`;
}
