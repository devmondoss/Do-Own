"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Flame,
  Heart,
  Info,
} from "lucide-react";
import {
  Badge,
  Card,
  FlowHeader,
  IconTile,
  ProgressBar,
} from "@/components/ui/primitives";
import { useDemo } from "@/providers/demo-provider";
import { useWallet } from "@/providers/wallet-provider";
import {
  MONTH_RULE,
  WEEK_RULE,
  addDays,
  mondayOf,
  monthName,
  monthStatus,
  nextMonth,
  prevMonth,
  recordedDays,
  todayKey,
  weekStatus,
  weekdayOf,
} from "@/lib/periods";

type View = "dia" | "semana" | "mes";
const LETTERS = ["L", "M", "M", "J", "V", "S", "D"];

export function ConstancyScreen() {
  const { data } = useDemo();
  const unit = useWallet().enabled ? "DOWN" : "créditos";
  const [view, setView] = useState<View>("semana");
  const today = todayKey();
  const [month, setMonth] = useState(today.slice(0, 7));
  const days = recordedDays(data.decisions);
  const streak = data.streakDays;
  const recordedToday = days.has(today);
  const hadHistory = data.decisions.length > 0;

  // F05: always tell the person how to keep or recover the streak.
  const message = recordedToday
    ? `¡Mantienes tu racha de ${streak} ${streak === 1 ? "día" : "días"}! Vuelve mañana para sumar otro.`
    : streak > 0
      ? `Registra una decisión hoy para mantener tu racha de ${streak} ${streak === 1 ? "día" : "días"}.`
      : hadHistory
        ? "Tu racha se reinició. No pasa nada: registra hoy y empieza otra."
        : "Registra tu primera decisión para empezar tu racha.";

  const week = weekStatus(data.decisions, mondayOf(today), today);
  const monthInfo = monthStatus(data.decisions, month, today);

  return (
    <main id="contenido" className="page constancy-page">
      <FlowHeader
        title="Mi constancia"
        back="/progreso"
        action={
          <Badge tone="amber">
            <Flame size={15} />
            {streak} {streak === 1 ? "día" : "días"}
          </Badge>
        }
      />
      <Card className="streak-message">
        <IconTile icon={Flame} tone="amber" />
        <div>
          <h2>
            Racha actual: {streak} {streak === 1 ? "día" : "días"}
          </h2>
          <p>{message}</p>
          {!recordedToday && (
            <Link className="button button-primary" href="/registro">
              Registrar hoy
            </Link>
          )}
        </div>
      </Card>

      <div className="segmented-control" role="tablist" aria-label="Periodo">
        {(
          [
            ["dia", "Día"],
            ["semana", "Semana"],
            ["mes", "Mes"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "dia" && (
        <Card className="constancy-panel" role="tabpanel" aria-label="Hoy">
          <h2>Hoy</h2>
          <ul className="today-checklist">
            <Check3
              done={recordedToday}
              icon={CircleDollarSign}
              label="Registrar una decisión"
              href="/registro"
            />
            <Check3
              done={recordedToday}
              icon={Heart}
              label="Asociar cómo te sentiste"
              href="/registro"
            />
            <Check3
              done={data.completedActions.includes("lesson")}
              icon={BookOpen}
              label="Hacer una microlección"
              href="/aprender"
            />
          </ul>
          <p className="field-hint">
            Para tu racha cuenta un día con al menos un registro.
          </p>
        </Card>
      )}

      {view === "semana" && (
        <Card
          className="constancy-panel"
          role="tabpanel"
          aria-label="Esta semana"
        >
          <h2>Esta semana · {week.days}/7 días</h2>
          <div className="week-days constancy-week">
            {LETTERS.map((letter, i) => {
              const key = addDays(week.monday, i);
              const done = days.has(key);
              const state = done
                ? "done"
                : key === today
                  ? "today"
                  : key > today
                    ? "future"
                    : "missed";
              return (
                <div key={key} className={`cal-cell cal-${state}`}>
                  <span>{letter}</span>
                  <span
                    className="cal-dot"
                    aria-label={`${key}: ${done ? "con registro" : "sin registro"}`}
                  >
                    {done ? <Check size={15} /> : Number(key.slice(8))}
                  </span>
                </div>
              );
            })}
          </div>
          <BonusProgress
            title={`Bono semanal · ${WEEK_RULE.units} ${unit}`}
            value={Math.min(week.days, WEEK_RULE.days)}
            max={WEEK_RULE.days}
            caption={`${Math.min(week.days, WEEK_RULE.days)} de ${WEEK_RULE.days} días con registro`}
            extra={
              week.withEvidence
                ? "✓ Al menos un registro con foto de evidencia"
                : "Falta: al menos un registro con foto de evidencia"
            }
            done={week.eligible}
          />
        </Card>
      )}

      {view === "mes" && (
        <Card className="constancy-panel" role="tabpanel" aria-label="Mes">
          <div className="month-nav">
            <button
              className="icon-button"
              aria-label="Mes anterior"
              onClick={() => setMonth(prevMonth(month))}
            >
              <ChevronLeft size={20} />
            </button>
            <h2>{monthName(month)}</h2>
            <button
              className="icon-button"
              aria-label="Mes siguiente"
              disabled={month >= today.slice(0, 7)}
              onClick={() => setMonth(nextMonth(month))}
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <MonthGrid month={month} today={today} days={days} />
          <BonusProgress
            title={`Bono mensual · ${MONTH_RULE.units} ${unit}`}
            value={Math.min(monthInfo.weeksEarned, MONTH_RULE.weeks)}
            max={MONTH_RULE.weeks}
            caption={`${Math.min(monthInfo.weeksEarned, MONTH_RULE.weeks)} de ${MONTH_RULE.weeks} semanas con bono semanal`}
            done={monthInfo.eligible}
          />
        </Card>
      )}

      <details className="technical-details constancy-rules">
        <summary>
          <Info size={15} /> ¿Cómo se cuenta mi constancia?
        </summary>
        <ul>
          <li>
            Un día cuenta cuando registras al menos una decisión (hora de la
            Ciudad de México).
          </li>
          <li>
            La racha suma días seguidos. Si pasa un día sin registro, vuelve a
            empezar.
          </li>
          <li>
            Bono semanal: {WEEK_RULE.days} de 7 días con registro (lunes a
            domingo) y al menos uno con foto de evidencia.
          </li>
          <li>
            Bono mensual: {MONTH_RULE.weeks} semanas del mes con bono semanal.
          </li>
          <li>
            Consultar tu progreso no da recompensas; registrar y aprender sí.
          </li>
        </ul>
      </details>
      <Link className="text-link" href="/mis-recompensas">
        Ver mis recompensas →
      </Link>
    </main>
  );
}

function Check3({
  done,
  icon,
  label,
  href,
}: {
  done: boolean;
  icon: typeof Heart;
  label: string;
  href: string;
}) {
  return (
    <li className={done ? "check-done" : ""}>
      <IconTile icon={icon} tone={done ? "mint" : "neutral"} />
      <span>{label}</span>
      {done ? (
        <Badge tone="mint">
          <Check size={14} /> Hecho
        </Badge>
      ) : (
        <Link className="text-link" href={href}>
          Hacerlo
        </Link>
      )}
    </li>
  );
}

function BonusProgress({
  title,
  value,
  max,
  caption,
  extra,
  done,
}: {
  title: string;
  value: number;
  max: number;
  caption: string;
  extra?: string;
  done: boolean;
}) {
  return (
    <div className="bonus-progress">
      <div>
        <strong>{title}</strong>
        {done && <Badge tone="mint">¡Lo lograste!</Badge>}
      </div>
      <ProgressBar value={(value / max) * 100} label={title} />
      <span className="field-hint">{caption}</span>
      {extra && <span className="field-hint">{extra}</span>}
    </div>
  );
}

function MonthGrid({
  month,
  today,
  days,
}: {
  month: string;
  today: string;
  days: Set<string>;
}) {
  const first = `${month}-01`;
  const cells: (string | null)[] = Array(weekdayOf(first)).fill(null);
  for (let d = first; d.slice(0, 7) === month; d = addDays(d, 1)) cells.push(d);
  const count = cells.filter((d) => d && days.has(d)).length;
  return (
    <>
      <div
        className="month-grid"
        role="grid"
        aria-label={`Días con registro en ${monthName(month)}`}
      >
        {LETTERS.map((l, i) => (
          <span key={`h${i}`} className="month-head" aria-hidden="true">
            {l}
          </span>
        ))}
        {cells.map((d, i) =>
          d ? (
            <span
              key={d}
              className={`month-cell ${days.has(d) ? "cal-done" : d === today ? "cal-today" : d > today ? "cal-future" : "cal-missed"}`}
              aria-label={`${Number(d.slice(8))}: ${days.has(d) ? "con registro" : "sin registro"}`}
            >
              {Number(d.slice(8))}
            </span>
          ) : (
            <span key={`e${i}`} />
          ),
        )}
      </div>
      <p className="field-hint">
        {count} {count === 1 ? "día" : "días"} con registro este mes.
      </p>
    </>
  );
}
