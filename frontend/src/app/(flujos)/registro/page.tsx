import type { Metadata } from "next";
import { RegisterScreen } from "@/components/features/register-screen";
export const metadata: Metadata = { title: "Registra tu decisión" };
export default function Page() {
  return <RegisterScreen />;
}
