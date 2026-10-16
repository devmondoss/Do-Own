import type { Metadata } from "next";
import { HomeScreen } from "@/components/features/home-screen";
export const metadata: Metadata = { title: "Inicio" };
export default function Page() {
  return <HomeScreen />;
}
