// Crea en Stellar Testnet las cuentas que necesita el backend de Do-Own:
//   - Emisor del activo DOWN (recompensa de prueba, sin valor en dinero).
//   - Patrocinador/tesorería: paga comisiones, patrocina reservas y entrega DOWN.
// Uso (desde frontend/):  npm run stellar:setup
// Escribe .env.local (ignorado por Git) e imprime las variables para Vercel.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

const HORIZON = "https://horizon-testnet.stellar.org";
const EXPLORER = "https://stellar.expert/explorer/testnet";
const server = new Horizon.Server(HORIZON);
const SUPPLY = "1000000";

async function friendbot(publicKey) {
  const res = await fetch(`https://friendbot.stellar.org/?addr=${publicKey}`);
  if (!res.ok && res.status !== 400)
    throw new Error(`Friendbot: ${res.status}`);
}

async function submit(source, keypairs, build) {
  const account = await server.loadAccount(source);
  let builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  });
  builder = build(builder);
  const tx = builder.setTimeout(120).build();
  keypairs.forEach((k) => tx.sign(k));
  const result = await server.submitTransaction(tx);
  return result.hash;
}

if (
  existsSync(".env.local") &&
  readFileSync(".env.local", "utf8").includes("STELLAR_SPONSOR_SECRET")
) {
  console.log(
    "Ya existe .env.local con STELLAR_SPONSOR_SECRET. Bórralo si quieres crear cuentas nuevas.",
  );
  process.exit(0);
}

const issuer = Keypair.random();
const sponsor = Keypair.random();
const asset = new Asset("DOWN", issuer.publicKey());

console.log("1/3 Fondeando cuentas con Friendbot…");
await friendbot(issuer.publicKey());
await friendbot(sponsor.publicKey());

console.log("2/3 Trustline del patrocinador a DOWN…");
const trustTx = await submit(sponsor.publicKey(), [sponsor], (b) =>
  b.addOperation(Operation.changeTrust({ asset })),
);

console.log(`3/3 Emitiendo ${SUPPLY} DOWN a la tesorería…`);
const issueTx = await submit(issuer.publicKey(), [issuer], (b) =>
  b
    .addOperation(Operation.setOptions({ homeDomain: "do-own.vercel.app" }))
    .addOperation(
      Operation.payment({
        destination: sponsor.publicKey(),
        asset,
        amount: SUPPLY,
      }),
    ),
);

const envText = `# Do-Own · Stellar Testnet (no subir a Git)
STELLAR_SPONSOR_SECRET=${sponsor.secret()}
STELLAR_ASSET_ISSUER=${issuer.publicKey()}
`;
writeFileSync(".env.local", envText);

console.log(`
Listo. Se escribió frontend/.env.local

Variables para Vercel (Settings → Environment Variables, Production y Preview):
  STELLAR_SPONSOR_SECRET = ${sponsor.secret()}
  STELLAR_ASSET_ISSUER   = ${issuer.publicKey()}

Guarda también la clave del emisor en un lugar seguro (no la usa la app):
  ISSUER_SECRET = ${issuer.secret()}

Evidencia:
  Emisor DOWN:   ${EXPLORER}/account/${issuer.publicKey()}
  Patrocinador:  ${EXPLORER}/account/${sponsor.publicKey()}
  Activo DOWN:   ${EXPLORER}/asset/DOWN-${issuer.publicKey()}
  Trustline tx:  ${EXPLORER}/tx/${trustTx}
  Emisión tx:    ${EXPLORER}/tx/${issueTx}
`);
