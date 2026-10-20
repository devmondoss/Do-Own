"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Loader2,
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
import { useWallet } from "@/providers/wallet-provider";

export function RewardScreen() {
  const { data, claimDemoReward, notify } = useDemo();
  const wallet = useWallet();
  const live = wallet.enabled;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const grant =
    data.rewards.find((reward) => reward.id === selectedId) ||
    data.rewards.find((reward) => reward.status === "available") ||
    data.rewards.at(-1);
  const claimed = grant?.status === "claimed";
  const next = data.rewards.find(
    (reward) => reward.status === "available" && reward.id !== grant?.id,
  );
  const receipt = grant ? wallet.rewardReceipts[grant.id] : undefined;
  async function claim() {
    if (!grant || claimed || busy) return;
    setSelectedId(grant.id);
    handleReclamar(grant.id);
    if (!live) {
      // DEMO(UI): memory-only balance when the server has no network config.
      claimDemoReward(grant.id);
      notify(
        "Sumaste una recompensa de demostración. No se realizó una transferencia real.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      // Server pays 1 DOWN with an idempotent memo hash; we wait for the
      // confirmed transaction before marking the reward as received.
      await wallet.claim(grant.id);
      claimDemoReward(grant.id);
      notify("¡Listo! Tu recompensa ya está en tu cuenta digital.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No pudimos entregar tu recompensa.",
      );
    } finally {
      setBusy(false);
    }
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
        <Badge tone="neutral">{live ? "Prueba" : "Demo"}</Badge>
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
                  : grant.reason === "semanal"
                    ? `Bono por tu constancia: ${grant.label ?? "esta semana"}.`
                    : grant.reason === "mensual"
                      ? `Bono por tu constancia: ${grant.label ?? "este mes"}.`
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
                    ? live
                      ? "YA ESTÁ EN TU CUENTA"
                      : "SUMASTE EN LA DEMO"
                    : "TU ACCIÓN SUMA"}
              </span>
              <span className="network-badge">
                <i />
                {live ? "Activo digital de prueba" : "Recompensa de ejemplo"}
              </span>
            </div>
            <div className="reward-value">
              {live
                ? `${grant?.units ?? 1} DOWN`
                : `${grant?.units ?? 1} ${(grant?.units ?? 1) === 1 ? "crédito" : "créditos"}`}
              <span>
                <Coins size={29} />
              </span>
            </div>
          </section>
          <div className="reward-checklist">
            {[
              "Una recompensa por registrar tu decisión.",
              "Otra al completar la microlección.",
              live
                ? "Llega a tu cuenta digital y es tuya."
                : "Disponible en tu cuenta de demostración.",
            ].map((text) => (
              <div key={text}>
                <span>
                  <Check size={18} strokeWidth={2.5} />
                </span>
                <p>{text}</p>
              </div>
            ))}
          </div>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          {live && receipt && (
            <details className="technical-details">
              <summary>Ver comprobante de la entrega</summary>
              <p className="field-hint">
                Operación confirmada en Stellar Testnet. Cualquiera puede
                verificarla en el explorador público.
              </p>
              <a
                className="text-link"
                href={receipt.explorerUrl}
                target="_blank"
                rel="noreferrer"
              >
                {receipt.transactionHash.slice(0, 10)}…
                <ExternalLink size={15} />
              </a>
            </details>
          )}
          <p className="reward-demo-note">
            {live ? (
              <>
                DOWN es un activo de prueba sin valor en dinero.
                <br />
                Sirve para ver y mover tu progreso.
              </>
            ) : (
              <>
                Los créditos son unidades de demostración.
                <br />
                No representan dinero real ni un activo emitido.
              </>
            )}
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
              {live ? "Recompensa recibida" : "Recompensa demo reclamada"}
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
            <Button
              onClick={claim}
              className="full-width"
              disabled={busy}
              aria-busy={busy}
            >
              {busy ? (
                <>
                  Enviando a tu cuenta…
                  <Loader2 size={19} className="spin" />
                </>
              ) : (
                <>
                  Recibir mi recompensa
                  <ArrowRight size={19} />
                </>
              )}
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
