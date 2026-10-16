import type { DecisionInput, TransferInput } from "@/types/do-own";

/** TODO(BACKEND): POST the private decision DTO to the authenticated API.
 * Do not send amount, category, emotion or note to Stellar.
 * Await the real response in the UI before showing persistence success.
 */
export function handleGuardarDecision(_input: DecisionInput): void {
  console.log(
    "[TODO:BACKEND] handleGuardarDecision — demostración, sin persistencia",
    _input.currency,
  );
}

/** TODO(STELLAR): call the backend's idempotent claim endpoint.
 * Server validates eligibility and submits/sponsors the Stellar transaction.
 * Never ship a secret seed, signing key or privileged API token to the browser.
 * Return RewardReceipt and confirm finality before showing a real balance.
 */
export function handleReclamar(rewardId: string): void {
  console.log(
    "[TODO:STELLAR] handleReclamar — demostración, sin transacción",
    rewardId,
  );
}

/** TODO(BACKEND): report lesson completion; server awards points exactly once. */
export function handleCompletarLeccion(): void {
  console.log("[TODO:BACKEND] handleCompletarLeccion — demostración");
}

/** TODO(STELLAR): fetch a server-issued proof and its confirmed transaction hash.
 * The displayed demo memo is illustrative, not a valid Stellar memo/tx identifier.
 */
export function handleVerExplorer(): void {
  console.log(
    "[TODO:STELLAR] handleVerExplorer — falta transactionHash confirmado",
  );
}

/** TODO(BACKEND): upload the File privately via FormData and return OCR/category
 * suggestions for user confirmation. No image or financial content on-chain.
 * This placeholder never invents an OCR result or uploads the selected file.
 */
export function handleAnalizarFoto(_file: File): void {
  console.log(
    "[TODO:BACKEND] handleAnalizarFoto — sin OCR ni subida",
    _file.type,
  );
}

/** TODO(STELLAR): validate destination, authenticate, prepare a transfer and return
 * pending/confirmed/failed. Sponsored reserves and fee sponsorship are separate.
 * Never expose private keys. The server enforces funds and idempotency.
 */
export function handleTransferirRecompensa(_input: TransferInput): void {
  console.log(
    "[TODO:STELLAR] handleTransferirRecompensa — simulación",
    _input.idempotencyKey,
  );
}

/** TODO(BACKEND): authenticated profile creation; consent/session policy pending. */
export function handleCrearPerfil(): void {
  console.log(
    "[TODO:BACKEND] handleCrearPerfil — demostración sin cuenta real",
  );
}
