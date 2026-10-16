import type { Metadata } from "next";
import { RewardScreen } from "@/components/features/reward-screen";
export const metadata: Metadata = { title: "Tu recompensa" };
export default function Page() {
  return <RewardScreen />;
}
