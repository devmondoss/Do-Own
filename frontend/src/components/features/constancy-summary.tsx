"use client";

import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { Card, IconTile, ProgressBar } from "@/components/ui/primitives";
import { useDemo } from "@/providers/demo-provider";
import {
  MONTH_RULE,
  WEEK_RULE,
  mondayOf,
  monthName,
  monthStatus,
  recordedDays,
  todayKey,
  weekStatus,
} from "@/lib/periods";

/**
 * F05 in "Mi progreso": daily, weekly and monthly constancy at a glance,
 * with the next step to keep the streak. Details live in "Mi constancia".
 */
export function ConstancySummary() {
  const { data } = useDemo();
  const today = todayKey();
  const streak = data.streakDays;
  const recordedToday = recordedDays(data.decisions).has(today);
  const week = weekStatus(data.decisions, mondayOf(today), today);
  const month = monthStatus(data.decisions, today.slice(0, 7), today);
  const actions = data.completedActions.length;
  const days = (n: number) => `${n} ${n === 1 ? "día" : "días"}`;

  return (
    <Card className="constancy-summary">
      <div className="amounts-head">
        <IconTile icon={Flame} tone="amber" />
        <div>
          <h2>Mi constancia · {days(streak)} de racha</h2>
          <p>
            {recordedToday
              ? "Ya registraste hoy. Vuelve mañana para sumar otro día."
              : streak > 0
                ? `Registra un gasto hoy para mantener tu racha de ${days(streak)}.`
                : "Registra un gasto hoy para empezar tu racha."}
          </p>
        </div>
      </div>
      <dl className="constancy-periods">
        <div>
          <dt>Hoy</dt>
          <dd>{actions} de 3 acciones</dd>
          <dd className="constancy-bar">
            <ProgressBar value={(actions / 3) * 100} label="Acciones de hoy" />
          </dd>
        </div>
        <div>
          <dt>Esta semana</dt>
          <dd>
            {Math.min(week.days, WEEK_RULE.days)} de {WEEK_RULE.days} días
          </dd>
          <dd className="constancy-bar">
            <ProgressBar
              value={
                (Math.min(week.days, WEEK_RULE.days) / WEEK_RULE.days) * 100
              }
              label="Avance del bono semanal"
            />
          </dd>
        </div>
        <div>
          <dt>En {monthName(month.month).split(" ")[0]}</dt>
          <dd>
            {Math.min(month.weeksEarned, MONTH_RULE.weeks)} de{" "}
            {MONTH_RULE.weeks} semanas
          </dd>
          <dd className="constancy-bar">
            <ProgressBar
              value={
                (Math.min(month.weeksEarned, MONTH_RULE.weeks) /
                  MONTH_RULE.weeks) *
                100
              }
              label="Avance del bono mensual"
            />
          </dd>
        </div>
      </dl>
      <Link className="text-link" href="/constancia">
        Ver el detalle por día, semana y mes
        <ArrowRight size={15} />
      </Link>
    </Card>
  );
}
