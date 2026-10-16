import { AppShell } from "@/components/ui/app-shell";

export default function FlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell focused>{children}</AppShell>;
}
