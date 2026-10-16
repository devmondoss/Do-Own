import type { DecisionRecord } from "@/types/do-own";

// Keep the weekly view consistent with the product's Mexico City calendar.
const calendar = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "America/Mexico_City",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function decisionDate(value: string) {
  return calendar.format(new Date(value));
}

export function recentDecisions(decisions: DecisionRecord[]) {
  if (!decisions.length) return [];
  const lastDay = decisions
    .map((record) => decisionDate(record.createdAt))
    .sort()
    .at(-1)!;
  const firstDay = new Date(Date.parse(`${lastDay}T00:00:00Z`) - 6 * 86400000)
    .toISOString()
    .slice(0, 10);
  return decisions
    .filter((record) => decisionDate(record.createdAt) >= firstDay)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function decisionWeekday(value: string) {
  return (new Date(`${decisionDate(value)}T00:00:00Z`).getUTCDay() + 6) % 7;
}
