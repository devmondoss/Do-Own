import type { Metadata } from "next";
import { HistoryScreen } from "@/components/features/history-screen";

export const metadata: Metadata = { title: "Mi historial" };

export default function Page() {
  return <HistoryScreen />;
}
