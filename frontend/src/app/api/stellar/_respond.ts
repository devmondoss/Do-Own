import { NextResponse } from "next/server";
import { StellarApiError } from "@/lib/stellar/server";

export function fail(error: unknown) {
  if (error instanceof StellarApiError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  console.error("[stellar] unexpected", error);
  return NextResponse.json(
    { error: "No pudimos completar la operación. Intenta de nuevo." },
    { status: 500 },
  );
}

export async function body(request: Request): Promise<Record<string, unknown>> {
  try {
    const value = await request.json();
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

export const noStore = { "Cache-Control": "no-store" };
