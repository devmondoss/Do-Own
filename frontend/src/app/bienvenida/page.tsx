import type { Metadata } from "next";
import { WelcomeScreen } from "@/components/features/welcome-screen";
export const metadata: Metadata = { title: "Bienvenida" };
export default function Page() {
  return <WelcomeScreen />;
}
