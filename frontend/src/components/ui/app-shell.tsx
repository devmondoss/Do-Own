"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  CirclePlus,
  House,
  Sparkles,
  Star,
  X,
  CalendarDays,
  Wallet,
} from "lucide-react";
import { Brand, cn } from "./primitives";
import { useDemo } from "@/providers/demo-provider";

const destinations = [
  { href: "/inicio", label: "Inicio", icon: House },
  { href: "/aprender", label: "Aprender", icon: BookOpen },
  { href: "/registro", label: "Registro", icon: CirclePlus },
  { href: "/progreso", label: "Recompensas", icon: Star },
];

export function BottomNavigation({ desktop = false }: { desktop?: boolean }) {
  const pathname = usePathname();
  const items = desktop
    ? [
        ...destinations,
        { href: "/reflexion", label: "Mi semana", icon: CalendarDays },
        { href: "/cuenta", label: "Mi cuenta", icon: Wallet },
      ]
    : destinations;
  return (
    <nav
      aria-label={desktop ? "Navegación de escritorio" : "Navegación principal"}
      className={cn(desktop ? "desktop-nav" : "bottom-nav")}
    >
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={
            pathname === href ||
            (!desktop &&
              href === "/progreso" &&
              ["/cuenta", "/reflexion"].includes(pathname))
              ? "page"
              : undefined
          }
          className={cn(
            "nav-item",
            (pathname === href ||
              (!desktop &&
                href === "/progreso" &&
                ["/cuenta", "/reflexion"].includes(pathname))) &&
              "nav-active",
          )}
        >
          <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({
  children,
  focused = false,
}: {
  children: ReactNode;
  focused?: boolean;
}) {
  const pathname = usePathname();
  const [panel, setPanel] = useState<"notifications" | "profile" | null>(null);
  const { data } = useDemo();
  return (
    <div className={cn("app-layout", focused && "app-layout-focused")}>
      <aside className="sidebar">
        <Brand />
        <div className="sidebar-intro">
          Pequeños pasos.
          <br />
          <strong>Un futuro más tuyo.</strong>
        </div>
        <BottomNavigation desktop />
        <div className="sidebar-note">
          <span className="little-spark">
            <Sparkles size={21} />
          </span>
          <p>
            Tu salud financiera florece
            <br />
            <strong>a tu propio ritmo.</strong>
          </p>
        </div>
        <span className="demo-caption">
          <span /> Experiencia de demostración
        </span>
      </aside>
      <div className="app-main">
        <header
          className={cn("top-bar", pathname === "/aprender" && "top-bar-learn")}
        >
          <Brand />
          <div className="top-actions">
            <span className="demo-label">Demo</span>
            <button
              className="notification-button icon-button"
              aria-label="Notificaciones"
              aria-expanded={panel === "notifications"}
              onClick={() =>
                setPanel(panel === "notifications" ? null : "notifications")
              }
            >
              <Bell size={21} />
              <i />
            </button>
            <button
              className="avatar-button"
              aria-label={`Ver perfil de ${data.profile.name}`}
              aria-expanded={panel === "profile"}
              onClick={() => setPanel(panel === "profile" ? null : "profile")}
            >
              <Image src="/images/ana.jpg" alt="" width={36} height={36} />
            </button>
          </div>
        </header>
        {panel && (
          <div className="account-panel">
            <button
              className="panel-close"
              aria-label="Cerrar panel"
              onClick={() => setPanel(null)}
            >
              <X size={18} />
            </button>
            {panel === "notifications" ? (
              <>
                <span className="eyebrow">TU ESPACIO</span>
                <h2>Hoy también cuenta ✨</h2>
                <p>
                  Tienes 3 acciones para cuidar tu bienestar financiero. Cada
                  pequeño paso suma.
                </p>
                <Link
                  className="text-link"
                  href="/inicio"
                  onClick={() => setPanel(null)}
                >
                  Ver mis acciones →
                </Link>
              </>
            ) : (
              <>
                <span className="eyebrow">MI PERFIL</span>
                <h2>
                  {data.profile.name} · Nivel {data.profile.level}
                </h2>
                <p>
                  Tu progreso es tuyo. Llevas {data.streakDays} días
                  construyendo buenos hábitos.
                </p>
                <span className="demo-caption">Perfil de demostración</span>
              </>
            )}
          </div>
        )}
        {children}
        {!focused && <BottomNavigation />}
      </div>
    </div>
  );
}
