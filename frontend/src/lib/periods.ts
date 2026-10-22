// Calendar helpers and constancy rules (Mexico City calendar).
// Product Definition F05/F06: daily, weekly and monthly constancy, with
// period rewards that are transparent about why they apply or not.
import type { DecisionRecord, DemoReward } from "@/types/do-own";
import { decisionDate } from "./decision-summary";

const DAY = 86400000;

/** "2026-10-19" for now, in Mexico City. */
export function todayKey(now = new Date()) {
  return decisionDate(now.toISOString());
}

/** Noon UTC of a YYYY-MM-DD key: safe for day arithmetic. */
export const noon = (key: string) => Date.parse(`${key}T12:00:00Z`);
export const keyOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);
export const addDays = (key: string, n: number) => keyOf(noon(key) + n * DAY);

/** Monday (0) … Sunday (6). */
export const weekdayOf = (key: string) =>
  (new Date(noon(key)).getUTCDay() + 6) % 7;

export const mondayOf = (key: string) => addDays(key, -weekdayOf(key));

/** ISO week id like "2026-W43" (the week belongs to the year of its Thursday). */
export function isoWeekId(key: string) {
  const thursday = addDays(mondayOf(key), 3);
  const year = Number(thursday.slice(0, 4));
  const jan4 = `${year}-01-04`;
  const week =
    Math.round((noon(mondayOf(thursday)) - noon(mondayOf(jan4))) / (7 * DAY)) +
    1;
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** Month a week counts for: the month of its Thursday. */
export const weekMonth = (weekMonday: string) =>
  addDays(weekMonday, 3).slice(0, 7);

/** Repeated operations (F01) never count for constancy or rewards. */
export const validDecisions = (decisions: DecisionRecord[]) =>
  decisions.filter((d) => !d.duplicate);

export function recordedDays(decisions: DecisionRecord[]) {
  return new Set(
    validDecisions(decisions).map((d) => decisionDate(d.createdAt)),
  );
}

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
export const monthName = (month: string) =>
  `${MONTHS[Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`;
export const shortDate = (key: string) =>
  `${Number(key.slice(8, 10))} ${MONTHS[Number(key.slice(5, 7)) - 1].slice(0, 3)}`;

// ---- Rules (kept simple and visible to the person) ----
export const WEEK_RULE = { days: 5, units: 3 };
export const MONTH_RULE = { weeks: 3, units: 10 };

export interface WeekStatus {
  id: string; // reward id: week-2026-W43
  monday: string;
  sunday: string;
  days: number;
  withEvidence: boolean;
  closed: boolean; // the week already ended
  eligible: boolean;
  missing: string[]; // human reasons when not eligible
}

export interface MonthStatus {
  id: string; // reward id: month-2026-10
  month: string;
  weeksEarned: number;
  closed: boolean;
  eligible: boolean;
  missing: string[];
}

export function weekStatus(
  decisions: DecisionRecord[],
  monday: string,
  today = todayKey(),
): WeekStatus {
  const sunday = addDays(monday, 6);
  const inWeek = validDecisions(decisions).filter((d) => {
    const k = decisionDate(d.createdAt);
    return k >= monday && k <= sunday;
  });
  const days = new Set(inWeek.map((d) => decisionDate(d.createdAt))).size;
  const withEvidence = inWeek.some((d) => d.photoAttached);
  const missing: string[] = [];
  if (days < WEEK_RULE.days)
    missing.push(`${days} de ${WEEK_RULE.days} días con registro`);
  if (!withEvidence) missing.push("ningún registro con foto de evidencia");
  return {
    id: `week-${isoWeekId(monday)}`,
    monday,
    sunday,
    days,
    withEvidence,
    closed: today > sunday,
    eligible: missing.length === 0,
    missing,
  };
}

export function monthStatus(
  decisions: DecisionRecord[],
  month: string,
  today = todayKey(),
): MonthStatus {
  // Weeks whose Thursday falls in this month.
  let monday = mondayOf(`${month}-01`);
  if (weekMonth(monday) !== month) monday = addDays(monday, 7);
  let weeksEarned = 0;
  while (weekMonth(monday) === month) {
    if (weekStatus(decisions, monday, today).eligible) weeksEarned += 1;
    monday = addDays(monday, 7);
  }
  const lastDay = addDays(`${nextMonth(month)}-01`, -1);
  const missing =
    weeksEarned >= MONTH_RULE.weeks
      ? []
      : [`${weeksEarned} de ${MONTH_RULE.weeks} semanas con bono semanal`];
  return {
    id: `month-${month}`,
    month,
    weeksEarned,
    closed: today > lastDay,
    eligible: missing.length === 0,
    missing,
  };
}

export function nextMonth(month: string) {
  const y = Number(month.slice(0, 4));
  const m = Number(month.slice(5, 7));
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}
export function prevMonth(month: string) {
  const y = Number(month.slice(0, 4));
  const m = Number(month.slice(5, 7));
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

/** Period rewards the person has earned, ready to be added as "available". */
export function earnedPeriodRewards(
  decisions: DecisionRecord[],
  today = todayKey(),
): DemoReward[] {
  if (!decisions.length) return [];
  const first = [...recordedDays(decisions)].sort()[0];
  const out: DemoReward[] = [];
  for (let m = mondayOf(first); m <= today; m = addDays(m, 7)) {
    const w = weekStatus(decisions, m, today);
    if (w.eligible)
      out.push({
        id: w.id,
        reason: "semanal",
        units: WEEK_RULE.units,
        status: "available",
        label: `Semana del ${shortDate(w.monday)} al ${shortDate(w.sunday)}`,
      });
  }
  for (
    let month = first.slice(0, 7);
    month <= today.slice(0, 7);
    month = nextMonth(month)
  ) {
    const s = monthStatus(decisions, month, today);
    if (s.eligible)
      out.push({
        id: s.id,
        reason: "mensual",
        units: MONTH_RULE.units,
        status: "available",
        label: `Mes de ${monthName(month)}`,
      });
  }
  return out;
}

/** Consecutive days with a record, counting back from today (or yesterday). */
export function computeStreak(decisions: DecisionRecord[], today = todayKey()) {
  const days = recordedDays(decisions);
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
