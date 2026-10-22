// Product Definition F01: avoid rewarding the same operation twice.
// A record is a duplicate when it reuses a photo already registered, or
// repeats the same purchase (concept + amount + currency) within 10 minutes.
import type { DecisionRecord } from "@/types/do-own";

export const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

/** SHA-256 of the photo bytes (hex). Only the fingerprint is kept, not the photo. */
export async function photoFingerprint(
  file: Blob,
): Promise<string | undefined> {
  try {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      await file.arrayBuffer(),
    );
    return [...new Uint8Array(digest)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return undefined;
  }
}

const norm = (s = "") =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");

export function duplicateReason(
  decisions: DecisionRecord[],
  input: {
    item?: string;
    amount: string;
    currency?: string;
    photoHash?: string;
  },
  now = Date.now(),
): string | null {
  for (const d of decisions) {
    if (input.photoHash && d.photoHash === input.photoHash)
      return "Esta foto ya se usó en otro registro.";
  }
  for (const d of decisions) {
    if (
      norm(d.item) === norm(input.item) &&
      Number(d.amount) === Number(input.amount) &&
      (d.currency ?? "MXN") === (input.currency ?? "MXN") &&
      now - Date.parse(d.createdAt) < DUPLICATE_WINDOW_MS
    )
      return "Ya registraste este mismo gasto hace unos minutos.";
  }
  return null;
}
