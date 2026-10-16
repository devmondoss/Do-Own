import type { Metadata } from "next";
import { ProofScreen } from "@/components/features/proof-screen";
export const metadata: Metadata = { title: "Tu comprobante" };
export default function Page() {
  return <ProofScreen />;
}
