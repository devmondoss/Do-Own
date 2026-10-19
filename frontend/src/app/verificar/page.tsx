import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyScreen } from "@/components/features/verify-screen";

export const metadata: Metadata = { title: "Verificar constancia" };

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyScreen />
    </Suspense>
  );
}
