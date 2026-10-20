"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronRight,
  CircleDollarSign,
  Flame,
  Heart,
  ReceiptText,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import {
  Badge,
  ButtonLink,
  Card,
  IconTile,
  ProgressBar,
  ProgressRing,
  SectionHeading,
} from "@/components/ui/primitives";
import { useDemo } from "@/providers/demo-provider";
import { formatDown, useWallet } from "@/providers/wallet-provider";
import { decisionWeekday, recentDecisions } from "@/lib/decision-summary";
import { lessons } from "@/data/mock-data";
import { AmountsSummary } from "./amounts-summary";

export function ProgressScreen() {
  const { data, live } = useDemo();
  const lessonsDone =
    data.lessonsCompleted?.length ?? (data.lessonCompleted ? 1 : 0);
  const wallet = useWallet();
  const [tab, setTab] = useState<"history" | "earn">("history");
  const [showAll, setShowAll] = useState(false);
  const pending = data.rewards.filter(
    (reward) => reward.status === "available",
  ).length;
  const records = recentDecisions(data.decisions);
  const activity = ["L", "M", "M", "J", "V", "S", "D"].map((day, index) => ({
    day,
    count: records.filter(
      (record) => decisionWeekday(record.createdAt) === index,
    ).length,
  }));
  const max = Math.max(1, ...activity.map((item) => item.count));
  return (
    <main id="contenido" className="page progress-page">
      <div className="progress-heading">
        <div>
          <Link href="/inicio" className="back-caption">
            <ArrowLeft size={13} />
            Tu crecimiento
          </Link>
          <h1>Mi progreso</h1>
        </div>
        <Badge tone="mint">
          <i className="status-dot" />
          Nivel {data.profile.level}
        </Badge>
      </div>
      <section className="balance-card">
        <div className="balance-meta">
          <span className="network-badge">
            <i />
            {wallet.enabled ? "Tu cuenta digital" : "Cuenta de demostración"}
          </span>
          <Link
            href="/cuenta"
            className="wallet-icon"
            aria-label="Abrir mi cuenta digital"
          >
            <Wallet size={22} />
          </Link>
        </div>
        <p>Tu saldo en recompensas</p>
        <div className="balance-number">
          {wallet.enabled ? formatDown(wallet.balance) : data.balanceUnits}
          <span>{wallet.enabled ? "DOWN" : "créditos"}</span>
        </div>
        <div className="balance-footer">
          <span>
            <BadgeCheck size={15} />
            {wallet.enabled ? "Activo de prueba" : "Saldo de ejemplo"}
          </span>
          <button onClick={() => setTab("earn")}>
            Cómo ganar
            <ArrowRight size={14} />
          </button>
        </div>
      </section>
      <div
        className="segmented-control"
        role="tablist"
        aria-label="Información de recompensas"
      >
        <button
          id="tab-history"
          role="tab"
          aria-selected={tab === "history"}
          aria-controls="panel-history"
          onClick={() => setTab("history")}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              setTab("earn");
              document.getElementById("tab-earn")?.focus();
            }
          }}
        >
          Historial
        </button>
        <button
          id="tab-earn"
          role="tab"
          aria-selected={tab === "earn"}
          aria-controls="panel-earn"
          onClick={() => setTab("earn")}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              setTab("history");
              document.getElementById("tab-history")?.focus();
            }
          }}
        >
          Cómo ganar
        </button>
      </div>
      {tab === "history" ? (
        <div
          role="tabpanel"
          id="panel-history"
          aria-labelledby="tab-history"
          className="progress-content"
        >
          <AmountsSummary decisions={data.decisions} latest={5} />
          <Card className="streak-card">
            <div className="streak-title">
              <IconTile icon={Flame} tone="amber" />
              <div>
                <h2>
                  {live ? "Tu racha" : "Racha de ejemplo"}: {data.streakDays}{" "}
                  {data.streakDays === 1 ? "día" : "días"}{" "}
                  <span aria-hidden="true">🔥</span>
                </h2>
                <p>
                  {live
                    ? "Esta semana (lunes a domingo). Tus montos de semanas anteriores siguen en tu historial."
                    : "Tus registros de ejemplo y de esta sesión"}
                </p>
              </div>
            </div>
            <div
              className="streak-chart"
              role="img"
              aria-label={`Registros por día: ${activity.map((item, i) => `${["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"][i]} ${item.count}`).join(", ")}.`}
            >
              {activity.map(({ day, count }, index) => (
                <div className="chart-day" key={index}>
                  <span className="chart-marker">{count || ""}</span>
                  <div className="bar-area">
                    <span
                      className={count ? "chart-bar" : "chart-bar chart-empty"}
                      style={{
                        height: count ? `${(count / max) * 100}%` : "12%",
                      }}
                    >
                      {count > 0 && <i />}
                    </span>
                  </div>
                  <span className="chart-label">{day}</span>
                </div>
              ))}
            </div>
            <div className="progress-links">
              <Link className="text-link" href="/constancia">
                Ver mi constancia (día, semana, mes)
                <ArrowRight size={15} />
              </Link>
              <Link className="text-link" href="/historial">
                Ver mi historial completo
                <ArrowRight size={15} />
              </Link>
              <Link className="text-link" href="/mis-recompensas">
                Ver mis recompensas
                <ArrowRight size={15} />
              </Link>
              <Link
                className="text-link chart-reflection-link"
                href="/reflexion"
              >
                Explorar mi reflexión semanal
                <ArrowRight size={15} />
              </Link>
            </div>
          </Card>
          <section>
            <SectionHeading
              aside={
                <button
                  className="text-link"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Ver menos" : "Ver todas"}
                </button>
              }
            >
              Tus acciones
            </SectionHeading>
            <div className="goals-grid">
              <Metric
                title="Aprender algo nuevo"
                subtitle={`${lessonsDone}/${lessons.length} microlecciones completadas`}
                value={(lessonsDone / lessons.length) * 100}
                icon={BookOpen}
              />
              <Metric
                title="Registrar cómo te sientes"
                subtitle={`${data.decisions.length} decisiones con una emoción`}
                value={data.decisions.length ? 100 : 0}
                tone="mint"
                icon={Heart}
              />
              {showAll && (
                <Metric
                  title="Acciones de hoy"
                  subtitle={`${data.completedActions.length}/3 acciones completadas en la sesión`}
                  value={Math.round((data.completedActions.length / 3) * 100)}
                  icon={Star}
                />
              )}
            </div>
          </section>
          <Card className="bonus-card">
            <IconTile icon={Sparkles} tone="amber" />
            <div>
              <Badge tone="amber">Tu siguiente paso</Badge>
              <h3>
                {pending
                  ? `Tienes ${pending} ${pending === 1 ? "recompensa disponible" : "recompensas disponibles"} en la demo.`
                  : "Cada registro y cada nueva microlección completada suman una recompensa."}
              </h3>
              <ProgressBar
                value={(data.completedActions.length / 3) * 100}
                tone="amber"
                label="Acciones de esta sesión"
              />
            </div>
          </Card>
          <Link href="/comprobante" className="proof-link">
            <IconTile icon={ReceiptText} />
            <div>
              <strong>Tu constancia tiene un sello</strong>
              <span>Ver tu comprobante semanal</span>
            </div>
            <ChevronRight size={19} />
          </Link>
        </div>
      ) : (
        <div
          role="tabpanel"
          id="panel-earn"
          aria-labelledby="tab-earn"
          className="earn-panel"
        >
          <Card>
            <span className="eyebrow">PEQUEÑAS ACCIONES, GRANDES HÁBITOS</span>
            <h2>Tu constancia suma</h2>
            <p>
              Registrar una decisión con su emoción habilita una recompensa.
              Completar la microlección habilita otra adicional, una sola vez.
            </p>
            {[
              {
                icon: CircleDollarSign,
                title: "Registra y recibe",
                text: "Una recompensa por tu decisión y su emoción.",
                points: 75,
              },
              {
                icon: BookOpen,
                title: "Aprende y suma otra",
                text: "Una recompensa adicional por completar la lección.",
                points: 25,
              },
              {
                icon: Wallet,
                title: "Conoce lo que es tuyo",
                text: "Consulta tu cuenta y practica un envío.",
                points: 0,
              },
            ].map(({ icon, title, text, points }) => (
              <div className="earn-step" key={title}>
                <IconTile icon={icon} />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                {points > 0 && <Badge>+{points} pts</Badge>}
              </div>
            ))}
            <ButtonLink href="/registro">
              Registrar una decisión
              <ArrowRight size={18} />
            </ButtonLink>
          </Card>
          <div className="info-note">
            <Check size={17} />
            <p>
              Los créditos son unidades de demostración. No equivalen a dinero y
              se reinician al recargar. Las cantidades definitivas las
              configurará el equipo.
            </p>
          </div>
        </div>
      )}
      <div className="progress-quick-actions">
        <ButtonLink href="/recompensa" variant="secondary">
          Ver recompensas
          <Star size={17} />
        </ButtonLink>
        <ButtonLink href="/cuenta" variant="outline">
          Mi cuenta digital
          <Wallet size={17} />
        </ButtonLink>
        <ButtonLink href="/reflexion" variant="quiet">
          Mi reflexión semanal
          <ArrowRight size={17} />
        </ButtonLink>
      </div>
    </main>
  );
}
function Metric({
  title,
  subtitle,
  value,
  tone = "violet",
  icon,
}: {
  title: string;
  subtitle: string;
  value: number;
  tone?: "violet" | "mint";
  icon: typeof BookOpen;
}) {
  return (
    <Card className="goal-card">
      <div className="goal-top">
        <IconTile icon={icon} tone={tone} />
        <ProgressRing value={value} tone={tone} label={title} />
      </div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
      <ProgressBar value={value} tone={tone} label={title} />
    </Card>
  );
}
