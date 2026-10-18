// Recorre el flujo completo contra la API de Do-Own (local o en Vercel) y deja
// evidencia pública verificable en Stellar Testnet.
// Uso (desde frontend/):
//   npm run stellar:evidence                          → http://localhost:3000
//   npm run stellar:evidence -- https://do-own.vercel.app
// Escribe docs/semana4/EvidenciaTestnet.md con los enlaces al explorador.
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const EXPLORER = "https://stellar.expert/explorer/testnet";
const NP = Networks.TESTNET;
const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const tx = (h) => `${EXPLORER}/tx/${h}`;
const acc = (a) => `${EXPLORER}/account/${a}`;

async function api(path, payload) {
  const res = await fetch(`${BASE}${path}`, {
    method: payload ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} → ${res.status} ${data.error ?? ""}`);
  return data;
}

async function onboard(kp) {
  const r = await api("/api/stellar/onboard", { publicKey: kp.publicKey() });
  const t = TransactionBuilder.fromXDR(r.xdr, NP);
  t.sign(kp);
  return (await server.submitTransaction(t)).hash;
}

async function userTx(kp, build, memo) {
  const account = await server.loadAccount(kp.publicKey());
  const t = build(
    new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NP }),
  )
    .addMemo(memo)
    .setTimeout(120)
    .build();
  t.sign(kp);
  return t.toXDR();
}

const sha = (...parts) => {
  const h = createHash("sha256");
  parts.forEach((p) => h.update(p));
  return h.digest();
};

console.log(`API: ${BASE}`);
const config = await api("/api/stellar/config");
if (!config.enabled)
  throw new Error(
    "El servidor no tiene STELLAR_SPONSOR_SECRET / STELLAR_ASSET_ISSUER.",
  );
const asset = new Asset(config.asset.code, config.asset.issuer);

const ana = Keypair.random();
const beto = Keypair.random();
console.log("1. Cuentas con reservas patrocinadas (0 XLM)…");
const onboardAna = await onboard(ana);
const onboardBeto = await onboard(beto);

console.log("2. Recompensa por registro (y reintento idempotente)…");
const rewardId = `record-${randomUUID()}`;
const reward = await api("/api/stellar/reward", {
  publicKey: ana.publicKey(),
  rewardId,
});
const retry = await api("/api/stellar/reward", {
  publicKey: ana.publicKey(),
  rewardId,
});
const lesson = await api("/api/stellar/reward", {
  publicKey: ana.publicKey(),
  rewardId: "lesson-antojo-v1",
});

console.log("3. Sello semanal (raíz Merkle con sal, fee bump)…");
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
let level = records.map((r) =>
  sha(randomBytes(16), Buffer.from(JSON.stringify(r))),
);
while (level.length > 1) {
  const next = [];
  for (let i = 0; i < level.length; i += 2)
    next.push(i + 1 < level.length ? sha(level[i], level[i + 1]) : level[i]);
  level = next;
}
const root = level[0].toString("hex");
const sealXdr = await userTx(
  ana,
  (b) => b.addOperation(Operation.bumpSequence({ bumpTo: "0" })),
  Memo.hash(root),
);
const seal = await api("/api/stellar/sponsor", { xdr: sealXdr, kind: "seal" });

console.log("4. Envío de DOWN entre usuarios (fee bump)…");
const payXdr = await userTx(
  ana,
  (b) =>
    b.addOperation(
      Operation.payment({
        destination: beto.publicKey(),
        asset,
        amount: "0.5",
      }),
    ),
  Memo.text("Do-Own: envio"),
);
const transfer = await api("/api/stellar/sponsor", {
  xdr: payXdr,
  kind: "transfer",
});

console.log("5. Verificación del sello…");
const onChain = await server
  .transactions()
  .transaction(seal.transactionHash)
  .call();
const verified = Buffer.from(onChain.memo, "base64").toString("hex") === root;
const anaAccount = await server.loadAccount(ana.publicKey());
const xlm = anaAccount.balances.find((b) => b.asset_type === "native")?.balance;
const down = anaAccount.balances.find((b) => b.asset_code === "DOWN")?.balance;

const md = `# Evidencia en Stellar Testnet — Do-Own

Generado el ${new Date().toISOString()} con \`npm run stellar:evidence\` contra \`${BASE}\`.
Cada enlace abre la operación real en el explorador público stellar.expert (testnet).

## Infraestructura

| Elemento | Enlace |
|---|---|
| Activo de recompensa DOWN | [DOWN-${config.asset.issuer.slice(0, 6)}…](${EXPLORER}/asset/DOWN-${config.asset.issuer}) |
| Emisor de DOWN | [${config.asset.issuer.slice(0, 8)}…](${acc(config.asset.issuer)}) |
| Patrocinador / tesorería de Do-Own | [${config.sponsor.slice(0, 8)}…](${acc(config.sponsor)}) |

## Flujo del MVP

| # | Paso del producto | Capacidad de Stellar | Transacción |
|---|---|---|---|
| 1 | Se crea la cuenta digital de una persona usuaria (saldo 0 XLM) | Reservas patrocinadas (\`beginSponsoringFutureReserves\` + \`createAccount\` + \`changeTrust\`) | [${onboardAna.slice(0, 10)}…](${tx(onboardAna)}) |
| 2 | Se crea una segunda cuenta | Reservas patrocinadas | [${onboardBeto.slice(0, 10)}…](${tx(onboardBeto)}) |
| 3 | Recompensa por registrar una decisión | Pago de DOWN con memo hash idempotente | [${reward.transactionHash.slice(0, 10)}…](${reward.explorerUrl}) |
| 4 | Reintento del mismo reclamo (no paga dos veces) | Detección por memo hash | ${retry.transactionHash === reward.transactionHash ? "✅ devolvió la misma transacción" : "⚠️ distinta"} |
| 5 | Recompensa por completar la microlección | Pago de DOWN con memo hash | [${lesson.transactionHash.slice(0, 10)}…](${lesson.explorerUrl}) |
| 6 | Sello semanal de 3 registros (raíz Merkle con sal) | Memo hash firmado por la persona, comisión pagada con fee bump | [${seal.transactionHash.slice(0, 10)}…](${seal.explorerUrl}) |
| 7 | Envío de 0.5 DOWN a otra persona | Pago firmado por la persona, comisión pagada con fee bump | [${transfer.transactionHash.slice(0, 10)}…](${transfer.explorerUrl}) |

- Cuenta de ejemplo: [${ana.publicKey().slice(0, 8)}…](${acc(ana.publicKey())}) — saldo XLM: **${xlm}**, saldo DOWN: **${down}**.
- Raíz sellada: \`${root}\` — coincide con el memo publicado: **${verified ? "sí" : "no"}**.
- Página pública de verificación: ${BASE}/verificar?tx=${seal.transactionHash}&root=${root}
`;
writeFileSync("../docs/semana4/EvidenciaTestnet.md", md);
console.log(md);
