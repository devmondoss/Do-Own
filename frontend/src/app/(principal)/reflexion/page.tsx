import type { Metadata } from "next";
import { ReflectionScreen } from "@/components/features/reflection-screen";
export const metadata: Metadata = { title: "Mi reflexión semanal" };
export default function Page() {
  return <ReflectionScreen />;
}
