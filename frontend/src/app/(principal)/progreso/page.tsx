import type { Metadata } from "next";
import { ProgressScreen } from "@/components/features/progress-screen";
export const metadata: Metadata = { title: "Mi progreso" };
export default function Page() {
  return <ProgressScreen />;
}
