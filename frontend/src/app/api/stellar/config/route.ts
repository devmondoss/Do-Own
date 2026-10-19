import { NextResponse } from "next/server";
import { publicConfig } from "@/lib/stellar/server";
import { fail, noStore } from "../_respond";

export const dynamic = "force-dynamic";

/** Public, non-secret settings: whether the network integration is enabled,
 * the DOWN asset and the sponsor account (for verification on the explorer). */
export function GET() {
  try {
    return NextResponse.json(publicConfig(), { headers: noStore });
  } catch (error) {
    return fail(error);
  }
}
