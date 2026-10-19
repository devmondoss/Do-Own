import { NextResponse } from "next/server";
import { assertAdmin, runEvidence, setupTestnet } from "@/lib/stellar/admin";
import { fail, noStore } from "../_respond";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Abrir en el navegador (solo testnet, protegido por STELLAR_ADMIN_TOKEN):
 *  /api/stellar/admin?token=…&action=setup     → crea y fondea cuentas, emite DOWN
 *  /api/stellar/admin?token=…&action=evidence  → recorre el flujo y devuelve Markdown */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    assertAdmin(url.searchParams.get("token"));
    const action = url.searchParams.get("action");
    if (action === "setup")
      return NextResponse.json(await setupTestnet(), { headers: noStore });
    if (action === "evidence")
      return new NextResponse(await runEvidence(url.origin), {
        headers: { ...noStore, "Content-Type": "text/plain; charset=utf-8" },
      });
    return NextResponse.json(
      { error: "Usa action=setup o action=evidence." },
      { status: 400 },
    );
  } catch (error) {
    return fail(error);
  }
}
