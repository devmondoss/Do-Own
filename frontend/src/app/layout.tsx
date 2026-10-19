import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { DemoProvider } from "@/providers/demo-provider";
import { WalletProvider } from "@/providers/wallet-provider";
import { AvatarProvider } from "@/providers/avatar-provider";
import { PwaRegister } from "@/components/ui/pwa-register";

export const metadata: Metadata = {
  title: { default: "Do-Own · Tu progreso es tuyo", template: "%s · Do-Own" },
  description:
    "Pequeñas decisiones, grandes hábitos. Cuida tu bienestar financiero, aprende a tu ritmo y celebra tu progreso.",
  applicationName: "Do-Own",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Do-Own" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7C3AED",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <DemoProvider>
          <WalletProvider>
            <AvatarProvider>{children}</AvatarProvider>
          </WalletProvider>
        </DemoProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
