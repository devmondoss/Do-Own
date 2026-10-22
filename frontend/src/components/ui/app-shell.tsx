"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  LogOut,
  Camera,
  BookOpen,
  CirclePlus,
  House,
  Sparkles,
  TrendingUp,
  X,
  CalendarDays,
  Flame,
  Gift,
  History,
  Wallet,
  Coins,
} from "lucide-react";
import { Brand, cn } from "./primitives";
import { useDemo } from "@/providers/demo-provider";
import { formatDown, useWallet } from "@/providers/wallet-provider";
import { useAvatar } from "@/providers/avatar-provider";
import { LogoutDialog } from "./logout-dialog";

const destinations = [
  { href: "/inicio", label: "Inicio", icon: House },
  { href: "/aprender", label: "Aprende", icon: BookOpen },
  { href: "/registro", label: "Registro", icon: CirclePlus },
  { href: "/progreso", label: "Mi progreso", icon: TrendingUp },
];
// Mobile: "Historial" is one tap away (all registered amounts).
const mobileDestinations = [
  destinations[0],
  destinations[1],
  destinations[2],
  { href: "/historial", label: "Historial", icon: History },
  destinations[3],
];

// Pages reached from "Mi progreso" on mobile keep that tab highlighted.
const SUB_PAGES = ["/cuenta", "/reflexion", "/constancia", "/mis-recompensas"];

export function BottomNavigation({ desktop = false }: { desktop?: boolean }) {
  const pathname = usePathname();
  const items = desktop
    ? [
        ...destinations,
        { href: "/historial", label: "Mi historial", icon: History },
        { href: "/constancia", label: "Mi constancia", icon: Flame },
        { href: "/mis-recompensas", label: "Mis recompensas", icon: Gift },
        { href: "/reflexion", label: "Mi semana", icon: CalendarDays },
        { href: "/cuenta", label: "Mi cuenta", icon: Wallet },
      ]
    : mobileDestinations;
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
            (!desktop && href === "/progreso" && SUB_PAGES.includes(pathname))
              ? "page"
              : undefined
          }
          className={cn(
            "nav-item",
            (pathname === href ||
              (!desktop &&
                href === "/progreso" &&
                SUB_PAGES.includes(pathname))) &&
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
  const { data, live } = useDemo();
  const wallet = useWallet();
  const avatar = useAvatar();
  const balanceText = wallet.enabled
    ? `${formatDown(wallet.balance)} DOWN`
    : `${data.balanceUnits} créditos`;
  const logout = useRef<HTMLDialogElement>(null);
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
        {!live && (
          <span className="demo-caption">
            <span /> Experiencia de demostración
          </span>
        )}
      </aside>
      <div className="app-main">
        <header
          className={cn("top-bar", pathname === "/aprender" && "top-bar-learn")}
        >
          <Brand />
          <div className="top-actions">
            {!live && <span className="demo-label">Demo</span>}
            <Link
              href="/mis-recompensas"
              className="balance-chip"
              aria-label={`Tus recompensas acumuladas: ${balanceText}. Ver mis recompensas`}
            >
              <Coins size={16} aria-hidden="true" />
              {balanceText}
            </Link>
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
              aria-label={`Ver perfil de ${data.profile.name || "usuario"}`}
              aria-expanded={panel === "profile"}
              onClick={() => setPanel(panel === "profile" ? null : "profile")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- avatar may be a local data URL */}
              <img src={avatar.src} alt="" width={36} height={36} />
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
                  {data.profile.name || "Tu perfil"} · Nivel{" "}
                  {data.profile.level}
                </h2>
                <p>
                  {data.streakDays > 0
                    ? `Tu progreso es tuyo. Llevas ${data.streakDays} ${data.streakDays === 1 ? "día" : "días"} construyendo buenos hábitos.`
                    : "Tu progreso es tuyo. Registra tu primera decisión para empezar tu racha."}
                </p>
                <button
                  className="text-link"
                  onClick={() => {
                    setPanel(null);
                    avatar.openPicker();
                  }}
                >
                  <Camera size={16} />
                  Cambiar foto de perfil
                </button>
                <button
                  className="text-link logout-link"
                  onClick={() => {
                    setPanel(null);
                    logout.current?.showModal();
                  }}
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
                {!live && (
                  <span className="demo-caption">Perfil de demostración</span>
                )}
              </>
            )}
          </div>
        )}
        {children}
        {!focused && <BottomNavigation />}
        <LogoutDialog ref={logout} />
      </div>
    </div>
  );
}
