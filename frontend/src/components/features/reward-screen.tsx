"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Coins,
  Gift,
  Leaf,
  ReceiptText,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { Badge, Button, ButtonLink } from "@/components/ui/primitives";
import { useDemo } from "@/providers/demo-provider";
import { handleReclamar } from "@/lib/integrations";

export function RewardScreen() {
  const { data, claimDemoReward, notify } = useDemo();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const grant =
    data.rewards.find((reward) => reward.id === selectedId) ||
    data.rewards.find((reward) => reward.status === "available") ||
    data.rewards.at(-1);
  const claimed = grant?.status === "claimed";
  const next = data.rewards.find(
    (reward) => reward.status === "available" && reward.id !== grant?.id,
  );
  function claim() {
    if (!grant || claimed) return;
    setSelectedId(grant.id);
    handleReclamar(grant.id);
    // DEMO(UI): memory-only balance. TODO(STELLAR): await confirmed receipt.
    claimDemoReward(grant.id);
    notify(
      "Sumaste una recompensa de demostración. No se realizó una transferencia real.",
    );
  }
  return (
    <main id="contenido" className="flow-page reward-page">
      <header className="reward-header">
        <Link
          href="/progreso"
          className="icon-button"
          aria-label="Cerrar recompensa"
        >
          <X size={23} />
        </Link>
        <Link href="/inicio" className="reward-brand">
          <Leaf size={19} />
          Do-Own
        </Link>
        <Badge tone="neutral">Demo</Badge>
      </header>
      <div className="reward-main">
        <div className="reward-celebration">
          <div className="celebration-art" aria-hidden="true">
            <span className="celebration-spark one">
              <Sparkles size={24} />
            </span>
            <span className="celebration-spark two">
              <Star size={22} />
            </span>
            <span className="celebration-confetti" />
            <div className="gift-orbit">
              <div className="gift-core">
                <Gift size={46} strokeWidth={1.8} />
              </div>
              {grant && (
                <span className="gift-check">
                  <Check size={27} strokeWidth={3} />
                </span>
              )}
            </div>
          </div>
          <div className="reward-title">
            <h1>
              {!grant ? (
                <>
                  Tu siguiente
                  <br />
                  paso cuenta.
                </>
              ) : claimed ? (
                <>
                  ¡Un paso más
                  <br />
                  para ti!
                </>
              ) : (
                <>
                  ¡Recompensa
                  <br />
                  desbloqueada!
                </>
              )}
            </h1>
            <p>
              {!grant
                ? "Registra una decisión o completa una microlección."
                : grant.reason === "registro"
                  ? "Observaste una decisión y cómo te sentiste."
                  : "Aprendiste algo nuevo sobre tus decisiones."}
            </p>
          </div>
        </div>
        <div className="reward-details">
          <section className="reward-amount-card">
            <div>
              <span className="eyebrow">
                {!grant
                  ? "POR CADA PASO"
                  : claimed
                    ? "SUMASTE EN LA DEMO"
                    : "TU ACCIÓN SUMA"}
              </span>
              <span className="network-badge">
                <i />
                Recompensa de ejemplo
              </span>
            </div>
            <div className="reward-value">
              1 crédito
              <span>
                <Coins size={29} />
              </span>
            </div>
          </section>
          <div className="reward-checklist">
            {[
              "Una recompensa por registrar tu decisión.",
              "Otra al completar la microlección.",
              "Disponible en tu cuenta de demostración.",
            ].map((text) => (
              <div key={text}>
                <span>
                  <Check size={18} strokeWidth={2.5} />
                </span>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <p className="reward-demo-note">
            Los créditos son unidades de demostración.
            <br />
            No representan dinero real ni un activo emitido.
          </p>
        </div>
      </div>
      <footer className="reward-footer">
        {!grant ? (
          <>
            <ButtonLink href="/registro" className="full-width">
              Registrar una decisión
              <ArrowRight size={18} />
            </ButtonLink>
            <ButtonLink
              variant="secondary"
              href="/aprender"
              className="full-width"
            >
              Ir al microaprendizaje
            </ButtonLink>
          </>
        ) : claimed ? (
          <>
            <Button disabled className="full-width">
              Recompensa demo reclamada
              <CheckCircle2 size={19} />
            </Button>
            {next && (
              <Button
                className="full-width"
                variant="secondary"
                onClick={() => setSelectedId(next.id)}
              >
                Ver otra recompensa disponible
                <Gift size={18} />
              </Button>
            )}
            <ButtonLink
              href={
                grant.reason === "registro" && !data.lessonCompleted
                  ? "/aprender"
                  : "/cuenta"
              }
              variant="secondary"
              className="full-width"
            >
              {grant.reason === "registro" && !data.lessonCompleted
                ? "Aprender y sumar otra recompensa"
                : "Ver mi cuenta digital"}
              <ArrowRight size={18} />
            </ButtonLink>
            <ButtonLink variant="quiet" href="/comprobante">
              <ReceiptText size={17} />
              Ver comprobante semanal
            </ButtonLink>
          </>
        ) : (
          <>
            <Button onClick={claim} className="full-width">
              Recibir mi recompensa
              <ArrowRight size={19} />
            </Button>
            <Link href="/inicio" className="later-link">
              Hacerlo más tarde
            </Link>
          </>
        )}
        <Link href="/progreso" className="later-link">
          Volver a mi progreso
        </Link>
      </footer>
    </main>
  );
}
