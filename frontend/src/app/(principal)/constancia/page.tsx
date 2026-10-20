import type { Metadata } from "next";
import { ConstancyScreen } from "@/components/features/constancy-screen";

export const metadata: Metadata = { title: "Mi constancia" };

export default function Page() {
  return <ConstancyScreen />;
}
