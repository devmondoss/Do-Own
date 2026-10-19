import { NextResponse } from "next/server";
import { assertPublicKey, sendReward } from "@/lib/stellar/server";
import { body, fail, noStore } from "../_respond";

export const dynamic = "force-dynamic";

/** POST { publicKey, rewardId } → idempotent DOWN payment with memo hash. */
export async function POST(request: Request) {
  try {
    const { publicKey, rewardId } = await body(request);
    const receipt = await sendReward(assertPublicKey(publicKey), rewardId);
    return NextResponse.json(receipt, { headers: noStore });
  } catch (error) {
    return fail(error);
  }
}
