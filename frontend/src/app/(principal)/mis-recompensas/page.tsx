import type { Metadata } from "next";
import { MyRewardsScreen } from "@/components/features/my-rewards-screen";

export const metadata: Metadata = { title: "Mis recompensas" };

export default function Page() {
  return <MyRewardsScreen />;
}
