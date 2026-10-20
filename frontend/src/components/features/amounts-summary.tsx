"use client";

import Link from "next/link";
import { ArrowRight, NotebookText } from "lucide-react";
import { Card, IconTile } from "@/components/ui/primitives";
import { categoryLabels, formatMoney } from "@/lib/labels";
import { decisionDate } from "@/lib/decision-summary";
import { monthName, todayKey } from "@/lib/periods";
import type { Currency, DecisionRecord } from "@/types/do-own";

/** Sum of amounts per currency, in cents (pesos and dollars never mixed). */
export function totalsByCurrency(records: DecisionRecord[]) {
  const totals = new Map<Currency, number>();
  for (const r of records) {
    const c = r.currency ?? "MXN";
    totals.set(c, (totals.get(c) ?? 0) + Math.round(Number(r.amount) * 100));
  }
  return [...totals.entries()].map(([currency, cents]) => ({
    currency,
    text: formatMoney(cents / 100, currency),
  }));
}

export const totalsText = (records: DecisionRecord[]) =>
  totalsByCurrency(records)
    .map((t) => t.text)
    .join(" + ") || formatMoney(0);

/**
 * Every amount the person has registered stays on this device. This card
 * shows all-time and this-month totals and, optionally, the latest records.
 */
export function AmountsSummary({
  decisions,
  latest = 0,
}: {
  decisions: DecisionRecord[];
  latest?: number;
}) {
  const month = todayKey().slice(0, 7);
  const thisMonth = decisions.filter(
    (d) => decisionDate(d.createdAt).slice(0, 7) === month,
  );
  const recent = [...decisions]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, latest);
  return (
    <Card className="amounts-summary">
      <div className="amounts-head">
        <IconTile icon={NotebookText} tone="violet" />
        <div>
          <h2>Mis montos registrados</h2>
          <p>Se guardan en tu historial y no se borran al cambiar de semana.</p>
        </div>
      </div>
      <dl className="amounts-totals">
        <div>
          <dt>Total registrado</dt>
          <dd>{totalsText(decisions)}</dd>
          <dd className="amounts-count">
            {decisions.length}{" "}
            {decisions.length === 1 ? "registro" : "registros"}
          </dd>
        </div>
        <div>
          <dt>En {monthName(month).split(" ")[0]}</dt>
          <dd>{totalsText(thisMonth)}</dd>
          <dd className="amounts-count">
            {thisMonth.length}{" "}
            {thisMonth.length === 1 ? "registro" : "registros"}
          </dd>
        </div>
      </dl>
      {recent.length > 0 && (
        <ul className="amounts-recent">
          {recent.map((r) => (
            <li key={r.id}>
              <span>
                <strong>{r.item || categoryLabels[r.category]}</strong>
                <small>
                  {new Intl.DateTimeFormat("es-MX", {
                    day: "numeric",
                    month: "short",
                    timeZone: "America/Mexico_City",
                  }).format(new Date(r.createdAt))}{" "}
                  · {categoryLabels[r.category]}
                </small>
              </span>
              <strong>{formatMoney(r.amount, r.currency ?? "MXN")}</strong>
            </li>
          ))}
        </ul>
      )}
      {latest > 0 && (
        <Link className="text-link" href="/historial">
          Ver todos mis montos
          <ArrowRight size={15} />
        </Link>
      )}
    </Card>
  );
}
