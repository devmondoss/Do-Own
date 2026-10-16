"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
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
import type { DailyAction } from "@/types/do-own";

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
  const { data } = useDemo();
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
              <Image
                src="/images/ana.jpg"
                alt={data.profile.name}
                width={52}
                height={52}
                className="greeting-avatar"
              />
              <div>
                <h1>Hola, {data.profile.name}</h1>
                <p>
                  Tu progreso es tuyo <span aria-hidden="true">⭐</span>
                </p>
              </div>
            </div>
            <Badge tone="amber">
              <Flame size={15} />
              {data.streakDays} días
            </Badge>
          </div>
          <div className="week-panel">
            <div className="week-heading">
              <span>Racha de la semana</span>
              <strong>4/7 completados</strong>
            </div>
            <div className="week-days">
              {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
                <div
                  className={`week-day ${index === 4 ? "is-today" : ""} ${index > 4 ? "is-future" : ""}`}
                  key={index}
                >
                  <span>{day}</span>
                  <span className="day-circle">
                    {index < 4 ? (
                      <Check size={18} aria-label="Completado" />
                    ) : index === 4 ? (
                      "Hoy"
                    ) : (
                      <LockKeyhole size={14} aria-label="Próximo día" />
                    )}
                  </span>
                </div>
              ))}
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
