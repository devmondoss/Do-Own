"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDemo } from "@/providers/demo-provider";

// Pages anyone can open without a profile.
const PUBLIC = ["/bienvenida", "/verificar"];

/**
 * Nobody uses the app without at least a name: if this device has no
 * profile yet, every page sends the person to the welcome screen first.
 */
export function OnboardingGuard() {
  const { data, live, hydrated } = useDemo();
  const pathname = usePathname();
  const router = useRouter();
  const needsProfile =
    hydrated &&
    !PUBLIC.some((p) => pathname.startsWith(p)) &&
    (!data.profile.name.trim() || (live && !data.onboardingComplete));
  useEffect(() => {
    if (needsProfile) router.replace("/bienvenida");
  }, [needsProfile, router]);
  return null;
}
