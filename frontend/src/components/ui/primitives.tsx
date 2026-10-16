import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Leaf, type LucideIcon } from "lucide-react";

export function cn(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "quiet";
}) {
  return (
    <button
      className={cn("button", `button-${variant}`, className)}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "quiet";
  className?: string;
}) {
  return (
    <Link href={href} className={cn("button", `button-${variant}`, className)}>
      {children}
    </Link>
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("card", className)} {...props} />;
}
export function Badge({
  children,
  tone = "violet",
  className,
}: {
  children: ReactNode;
  tone?: "violet" | "mint" | "amber" | "neutral";
  className?: string;
}) {
  return (
    <span className={cn("badge", `badge-${tone}`, className)}>{children}</span>
  );
}
export function IconTile({
  icon: Icon,
  tone = "violet",
  className,
}: {
  icon: LucideIcon;
  tone?: "violet" | "mint" | "amber" | "rose" | "neutral";
  className?: string;
}) {
  return (
    <span className={cn("icon-tile", `tile-${tone}`, className)}>
      <Icon size={23} strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/inicio"
      className={cn("brand", compact && "brand-compact")}
      aria-label="Do-Own, ir a inicio"
    >
      <span className="brand-mark">
        <Leaf size={25} strokeWidth={1.9} />
      </span>
      <span>Do-Own</span>
    </Link>
  );
}
export function FlowHeader({
  title,
  back = "/inicio",
  action,
}: {
  title: string;
  back?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flow-header">
      <Link href={back} className="icon-button" aria-label="Volver">
        <ArrowLeft size={22} />
      </Link>
      <h1>{title}</h1>
      <div className="flow-header-action">{action}</div>
    </header>
  );
}
export function SectionHeading({
  children,
  aside,
}: {
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <h2>{children}</h2>
      {aside}
    </div>
  );
}
export function ProgressBar({
  value,
  tone = "violet",
  label,
}: {
  value: number;
  tone?: "violet" | "mint" | "amber";
  label: string;
}) {
  return (
    <div
      className={cn("progress-track", `progress-${tone}`)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
export function ProgressRing({
  value,
  tone = "violet",
  label,
}: {
  value: number;
  tone?: "violet" | "mint";
  label: string;
}) {
  return (
    <div
      className={cn("progress-ring", `ring-${tone}`)}
      role="img"
      aria-label={`${label}: ${value}%`}
    >
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle className="ring-track" cx="22" cy="22" r="18" />
        <circle
          className="ring-value"
          cx="22"
          cy="22"
          r="18"
          pathLength="100"
          strokeDasharray={`${value} 100`}
        />
      </svg>
      <span>{value}%</span>
    </div>
  );
}
