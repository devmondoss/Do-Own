import type { Metadata } from "next";
import { AccountScreen } from "@/components/features/account-screen";
export const metadata: Metadata = { title: "Mi cuenta digital" };
export default function Page() {
  return <AccountScreen />;
}
