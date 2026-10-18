import { NextResponse } from "next/server";
import { assertPublicKey, buildOnboarding } from "@/lib/stellar/server";
import { body, fail, noStore } from "../_respond";

export const dynamic = "force-dynamic";

/** POST { publicKey } → sponsor-signed account creation for the device to sign. */
export async function POST(request: Request) {
  try {
    const { publicKey } = await body(request);
    const result = await buildOnboarding(assertPublicKey(publicKey));
    return NextResponse.json(result, { headers: noStore });
  } catch (error) {
    return fail(error);
  }
}
