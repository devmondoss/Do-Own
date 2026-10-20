"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CircleDollarSign,
  ExternalLink,
  Gift,
  Hourglass,
  Info,
  Loader2,
  XCircle,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  FlowHeader,
  IconTile,
  ProgressBar,
  SectionHeading,
} from "@/components/ui/primitives";
import { useDemo } from "@/providers/demo-provider";
import { useWallet } from "@/providers/wallet-provider";
import { ClaimConfirmDialog } from "@/components/ui/claim-confirm-dialog";
import {
  MONTH_RULE,
  WEEK_RULE,
  addDays,
  mondayOf,
  monthName,
  monthStatus,
  shortDate,
  todayKey,
  weekStatus,
} from "@/lib/periods";
import type { DemoReward } from "@/types/do-own";

const reasonInfo: Record<
  DemoReward["reason"],
  { title: string; icon: typeof Gift; why: string }
> = {
  registro: {
    title: "Registro de una decisión",
    icon: CircleDollarSign,
    why: "Por registrar una decisión y cómo te sentiste.",
  },
  aprendizaje: {
    title: "Microlección completada",
    icon: BookOpen,
    why: "Por completar una microlección por primera vez.",
  },
  semanal: {
    title: "Bono semanal",
    icon: CalendarCheck,
    why: `Por registrar ${WEEK_RULE.days} de 7 días con al menos una evidencia.`,
  },
  mensual: {
    title: "Bono mensual",
    icon: CalendarDays,
    why: `Por lograr ${MONTH_RULE.weeks} bonos semanales en el mes.`,
  },
};

const fmt = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeZone: "America/Mexico_City",
      }).format(new Date(iso))
    : "";

export function MyRewardsScreen() {
  const { data, live, claimDemoReward, notify } = useDemo();
  const wallet = useWallet();
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, setPending] = useState<DemoReward | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const unit = wallet.enabled ? "DOWN" : "créditos";
  const today = todayKey();

  const available = data.rewards.filter((r) => r.status === "available");
  const claimed = data.rewards
    .filter((r) => r.status === "claimed")
    .sort((a, b) => (b.claimedAt ?? "").localeCompare(a.claimedAt ?? ""));
  const totalClaimed = claimed.reduce((sum, r) => sum + r.units, 0);

  const week = weekStatus(data.decisions, mondayOf(today), today);
  const month = monthStatus(data.decisions, today.slice(0, 7), today);
  // Last 4 closed weeks where the person did record something but the bonus did not apply.
  const notApplied = [1, 2, 3, 4]
    .map((n) =>
      weekStatus(data.decisions, addDays(mondayOf(today), -7 * n), today),
    )
    .filter((w) => w.days > 0 && !w.eligible);

  async function claim(reward: DemoReward) {
    if (busy) return;
    setBusy(reward.id);
    setErrors((e) => ({ ...e, [reward.id]: "" }));
    try {
      if (live && wallet.enabled) await wallet.claim(reward.id);
      claimDemoReward(reward.id);
      setPending(null);
      notify(`Recibiste ${reward.units} ${unit}.`);
    } catch (e) {
      setErrors((current) => ({
        ...current,
        [reward.id]: e instanceof Error ? e.message : "No se pudo entregar.",
      }));
    } finally {
      setBusy(null);
    }
  }

  return (
    <main id="contenido" className="page my-rewards-page">
      <FlowHeader title="Mis recompensas" back="/progreso" />

      <section className="balance-card rewards-summary">
        <p>Has recibido</p>
        <div className="balance-number">
          {totalClaimed}
          <span>{unit}</span>
        </div>
        <div className="balance-footer">
          <span>
            {available.length} por recibir · {claimed.length} recibidas
          </span>
          <Link href="/cuenta">Ver mi cuenta →</Link>
        </div>
      </section>

      <section>
        <SectionHeading>Por recibir</SectionHeading>
        {available.length === 0 ? (
          <Card className="empty-state">
            <IconTile icon={Gift} tone="neutral" />
            <p>
              No tienes recompensas pendientes. Registra una decisión o completa
              una microlección.
            </p>
          </Card>
        ) : (
          <div className="reward-list">
            {available.map((r) => {
              const info = reasonInfo[r.reason];
              return (
                <Card key={r.id} className="reward-row">
                  <IconTile icon={info.icon} tone="violet" />
                  <div>
                    <h3>{info.title}</h3>
                    <p>{r.label ?? info.why}</p>
                    {errors[r.id] && (
                      <p className="field-error" role="alert">
                        No se entregó: {errors[r.id]}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      setErrors((e) => ({ ...e, [r.id]: "" }));
                      setPending(r);
                    }}
                    disabled={!!busy}
                    aria-busy={busy === r.id}
                  >
                    {busy === r.id ? (
                      <Loader2 size={16} className="spin" />
                    ) : (
                      `+${r.units}`
                    )}
                    {busy === r.id ? "" : " Recibir"}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <SectionHeading>En camino</SectionHeading>
        <Card className="reward-progress">
          <div className="reward-progress-head">
            <IconTile icon={CalendarCheck} tone="mint" />
            <div>
              <h3>
                Bono semanal · {WEEK_RULE.units} {unit}
              </h3>
              <p>
                Semana del {shortDate(week.monday)} al {shortDate(week.sunday)}
              </p>
            </div>
            {week.eligible && <Badge tone="mint">Logrado</Badge>}
          </div>
          <ProgressBar
            value={(Math.min(week.days, WEEK_RULE.days) / WEEK_RULE.days) * 100}
            label="Avance del bono semanal"
          />
          <ul className="conditions">
            <li className={week.days >= WEEK_RULE.days ? "ok" : ""}>
              {Math.min(week.days, WEEK_RULE.days)} de {WEEK_RULE.days} días con
              registro
            </li>
            <li className={week.withEvidence ? "ok" : ""}>
              {week.withEvidence ? "Tienes" : "Falta"} al menos un registro con
              foto de evidencia
            </li>
          </ul>
        </Card>
        <Card className="reward-progress">
          <div className="reward-progress-head">
            <IconTile icon={CalendarDays} tone="amber" />
            <div>
              <h3>
                Bono mensual · {MONTH_RULE.units} {unit}
              </h3>
              <p>Mes de {monthName(month.month)}</p>
            </div>
            {month.eligible && <Badge tone="mint">Logrado</Badge>}
          </div>
          <ProgressBar
            value={
              (Math.min(month.weeksEarned, MONTH_RULE.weeks) /
                MONTH_RULE.weeks) *
              100
            }
            label="Avance del bono mensual"
          />
          <ul className="conditions">
            <li className={month.eligible ? "ok" : ""}>
              {Math.min(month.weeksEarned, MONTH_RULE.weeks)} de{" "}
              {MONTH_RULE.weeks} semanas con bono semanal
            </li>
          </ul>
        </Card>
      </section>

      {notApplied.length > 0 && (
        <section>
          <SectionHeading>No aplicaron</SectionHeading>
          <div className="reward-list">
            {notApplied.map((w) => (
              <Card key={w.id} className="reward-row reward-missed">
                <IconTile icon={XCircle} tone="neutral" />
                <div>
                  <h3>
                    Bono semanal · {shortDate(w.monday)} al{" "}
                    {shortDate(w.sunday)}
                  </h3>
                  <p>Motivo: {w.missing.join(" y ")}.</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeading>Recibidas</SectionHeading>
        {claimed.length === 0 ? (
          <Card className="empty-state">
            <IconTile icon={Hourglass} tone="neutral" />
            <p>Aquí verás cada recompensa que recibas y por qué.</p>
          </Card>
        ) : (
          <div className="reward-list">
            {claimed.map((r) => {
              const info = reasonInfo[r.reason];
              const receipt = wallet.rewardReceipts[r.id];
              return (
                <Card key={r.id} className="reward-row reward-claimed">
                  <IconTile icon={info.icon} tone="mint" />
                  <div>
                    <h3>{info.title}</h3>
                    <p>
                      {r.label ?? info.why}{" "}
                      {r.claimedAt ? `· ${fmt(r.claimedAt)}` : ""}
                    </p>
                    {receipt && (
                      <a
                        className="text-link"
                        href={receipt.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Comprobante <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                  <strong>+{r.units}</strong>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <ClaimConfirmDialog
        reward={pending}
        live={live && wallet.enabled}
        account={
          wallet.publicKey
            ? `${wallet.publicKey.slice(0, 4)}…${wallet.publicKey.slice(-4)}`
            : undefined
        }
        busy={!!pending && busy === pending.id}
        error={pending ? errors[pending.id] : undefined}
        onConfirm={() => pending && claim(pending)}
        onClose={() => setPending(null)}
      />

      <details className="technical-details">
        <summary>
          <Info size={15} /> ¿Cómo se calculan?
        </summary>
        <ul>
          <li>Registro de una decisión: 1 {unit}.</li>
          <li>
            Microlección completada (la primera vez): 1 {unit}. Repetirla no da
            más.
          </li>
          <li>
            Bono semanal: {WEEK_RULE.units} {unit} por {WEEK_RULE.days} de 7
            días con registro y al menos una evidencia.
          </li>
          <li>
            Bono mensual: {MONTH_RULE.units} {unit} por {MONTH_RULE.weeks} bonos
            semanales en el mes.
          </li>
          <li>
            Cada recompensa se entrega una sola vez y hay un límite de 12
            entregas por día.
          </li>
          <li>DOWN es un activo de prueba: no tiene valor en dinero.</li>
        </ul>
      </details>
    </main>
  );
}
