import type { Metadata } from "next";
import { LearnScreen } from "@/components/features/learn-screen";
export const metadata: Metadata = { title: "Aprende" };
export default function Page() {
  return <LearnScreen />;
}
