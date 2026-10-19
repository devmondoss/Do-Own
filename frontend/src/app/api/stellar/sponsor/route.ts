import { NextResponse } from "next/server";
import { feeBumpAndSubmit } from "@/lib/stellar/server";
import { body, fail, noStore } from "../_respond";

export const dynamic = "force-dynamic";

/** POST { xdr, kind: "seal" | "transfer" } → fee-bumped by Do-Own and submitted. */
export async function POST(request: Request) {
  try {
    const { xdr, kind } = await body(request);
    const result = await feeBumpAndSubmit(xdr, kind);
    return NextResponse.json(result, { headers: noStore });
  } catch (error) {
    return fail(error);
  }
}
