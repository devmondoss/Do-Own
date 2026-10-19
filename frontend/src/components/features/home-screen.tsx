"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  CircleDollarSign,
  Flame,
  Gift,
  Heart,
  LockKeyhole,
  Smile,
  Sparkles,
} from "lucide-react";
import {
  Badge,
  Card,
  IconTile,
  SectionHeading,
} from "@/components/ui/primitives";
import { useDemo } from "@/providers/demo-provider";
import { useAvatar } from "@/providers/avatar-provider";
import type { DailyAction, DecisionRecord } from "@/types/do-own";
import { decisionDate } from "@/lib/decision-summary";

const actions = [
  {
    id: "decision" as DailyAction,
    title: "Decisión financiera",
    text: "Registra una decisión de hoy",
    points: 50,
    icon: CircleDollarSign,
    tone: "amber" as const,
    href: "/registro",
  },
  {
    id: "emotion" as DailyAction,
    title: "Emoción del día",
    text: "Registra cómo te sientes",
    points: 25,
    icon: Heart,
    tone: "rose" as const,
    href: "/registro#emocion",
  },
  {
    id: "lesson" as DailyAction,
    title: "Microaprendizaje",
    text: "Un poquito de conocimiento",
    points: 25,
    icon: BookOpen,
    tone: "violet" as const,
    href: "/aprender",
  },
];

export function HomeScreen() {
  const { data, live } = useDemo();
  const week = live ? currentWeek(data.decisions) : null;
  const avatar = useAvatar();
  const completed = data.completedActions.length;
  return (
    <main id="contenido" className="page home-page">
      <div className="desktop-page-heading">
        <span className="eyebrow">TU BIENESTAR, DÍA A DÍA</span>
        <p className="desktop-title">Un pequeño paso hoy.</p>
        <p>Lo que haces por ti, se queda contigo.</p>
      </div>
      <div className="home-grid">
        <Card className="greeting-card">
          <div className="greeting-row">
            <div className="greeting-user">
              <button
                className="greeting-avatar-button"
                onClick={avatar.openPicker}
                aria-label="Cambiar foto de perfil"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- avatar may be a local data URL */}
                <img
                  src={avatar.src}
                  alt={data.profile.name}
                  width={52}
                  height={52}
                  className="greeting-avatar"
                />
                <span className="greeting-avatar-edit" aria-hidden="true">
                  <Camera size={12} />
                </span>
              </button>
              <div>
                <h1>
                  {data.profile.name ? `Hola, ${data.profile.name}` : "¡Hola!"}
                </h1>
                <p>
                  Tu progreso es tuyo <span aria-hidden="true">⭐</span>
                </p>
              </div>
            </div>
            <Badge tone="amber">
              <Flame size={15} />
              {data.streakDays} {data.streakDays === 1 ? "día" : "días"}
            </Badge>
          </div>
          <div className="week-panel">
            <div className="week-heading">
              <span>Racha de la semana</span>
              <strong>{week ? `${week.done}/7` : "4/7"} completados</strong>
            </div>
            <div className="week-days">
              {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => {
                const today = week ? week.today : 4;
                const done = week ? week.days[index] : index < 4;
                return (
                  <div
                    className={`week-day ${index === today ? "is-today" : ""} ${index > today ? "is-future" : ""} ${index < today && !done ? "is-missed" : ""}`}
                    key={index}
                  >
                    <span>{day}</span>
                    <span className="day-circle">
                      {done ? (
                        <Check size={18} aria-label="Completado" />
                      ) : index === today ? (
                        "Hoy"
                      ) : index > today ? (
                        <LockKeyhole size={14} aria-label="Próximo día" />
                      ) : (
                        <span aria-label="Sin registro" />
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
        <Link href="/recompensa" className="daily-reward">
          <span className="reward-icon">
            <Gift size={29} />
          </span>
          <div>
            <span className="eyebrow">
              TU CONSTANCIA SUMA <i className="status-dot" />
            </span>
            <p>
              Cada registro y microlección suman una recompensa para ti.
              <strong> Celebra tu siguiente paso.</strong>
            </p>
          </div>
          <ChevronRight className="reward-chevron" size={19} />
        </Link>
        <section className="daily-actions-section">
          <SectionHeading
            aside={<span className="points-caption">Gana +100 pts</span>}
          >
            <span className="heading-with-badge">
              Acciones diarias <Badge>{completed}/3</Badge>
            </span>
          </SectionHeading>
          <Card className="actions-card">
            {actions.map(({ id, title, text, points, icon, tone, href }) => {
              const done = data.completedActions.includes(id);
              return (
                <Link
                  href={href}
                  className={`action-row ${done ? "action-done" : ""}`}
                  key={id}
                >
                  <IconTile icon={icon} tone={tone} />
                  <div className="action-copy">
                    <h3>{title}</h3>
                    <p>{done ? "¡Un paso más para ti!" : text}</p>
                  </div>
                  <Badge tone={done || id === "decision" ? "mint" : "violet"}>
                    {done ? (
                      <Check size={17} aria-label="Completado" />
                    ) : (
                      `+${points} pts`
                    )}
                  </Badge>
                  <ChevronRight size={18} className="action-chevron" />
                </Link>
              );
            })}
          </Card>
        </section>
        <Card className="wellness-card">
          <IconTile icon={Smile} tone="mint" />
          <div>
            <h3>Tu salud financiera florece</h3>
            <p>Paso a paso, a tu propio ritmo</p>
          </div>
          <Link href="/reflexion" className="text-link">
            Ver mi semana <ArrowRight size={14} />
          </Link>
        </Card>
        <div className="home-footnote">
          <Sparkles size={15} />
          <span>Hoy es un buen día para empezar por ti.</span>
        </div>
      </div>
    </main>
  );
}

/** Monday-to-Sunday view of the current week (Mexico City calendar). */
function currentWeek(decisions: DecisionRecord[]) {
  const todayStr = decisionDate(new Date().toISOString());
  const todayNoon = Date.parse(`${todayStr}T12:00:00Z`);
  const today = (new Date(todayNoon).getUTCDay() + 6) % 7;
  const recorded = new Set(decisions.map((d) => decisionDate(d.createdAt)));
  const days = Array.from({ length: 7 }, (_, i) =>
    recorded.has(
      new Date(todayNoon + (i - today) * 86400000).toISOString().slice(0, 10),
    ),
  );
  return { today, days, done: days.filter(Boolean).length };
}
