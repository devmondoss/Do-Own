import type { Metadata } from "next";
import { LearnScreen } from "@/components/features/learn-screen";
export const metadata: Metadata = { title: "Aprender" };
export default function Page() {
  return <LearnScreen />;
}
