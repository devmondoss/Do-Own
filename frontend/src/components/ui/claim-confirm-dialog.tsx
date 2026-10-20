"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, Gift, Loader2, ShieldCheck, X } from "lucide-react";
import { Badge, Button, IconTile } from "./primitives";
import type { DemoReward } from "@/types/do-own";

const why: Record<DemoReward["reason"], string> = {
  registro: "Registraste una decisión y cómo te sentiste.",
  aprendizaje: "Completaste una microlección por primera vez.",
  semanal: "Bono semanal por tu constancia.",
  mensual: "Bono mensual por tu constancia.",
};

/**
 * H6/H7: before a reward is delivered the person reviews what she is
 * accepting, confirms it, and then sees a clear "waiting for the network"
 * state (the button cannot be pressed twice) until it is confirmed.
 */
export function ClaimConfirmDialog({
  reward,
  live,
  account,
  busy,
  error,
  onConfirm,
  onClose,
}: {
  reward: DemoReward | null;
  live: boolean;
  /** Short public account, when the wallet is ready. */
  account?: string;
  busy: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (reward && !el.open) el.showModal();
    if (!reward && el.open) el.close();
  }, [reward]);

  const unit = live ? "DOWN" : reward?.units === 1 ? "crédito" : "créditos";

  return (
    <dialog
      ref={dialog}
      className="lesson-dialog claim-dialog"
      aria-label="Confirma tu recompensa"
      onCancel={(e) => {
        if (busy) e.preventDefault();
        else onClose();
      }}
    >
      {reward && (
        <>
          <div className="lesson-dialog-header">
            <Badge tone="violet">REVISA ANTES DE ACEPTAR</Badge>
            <button
              className="icon-button"
              aria-label="Cerrar sin recibir"
              disabled={busy}
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
          <IconTile icon={busy ? Loader2 : Gift} tone="violet" />
          <h2>
            {busy ? "Esperando confirmación…" : "¿Aceptas esta recompensa?"}
          </h2>
          {busy ? (
            <p role="status" aria-live="polite">
              {live
                ? "Estamos registrando la entrega en la red de Stellar. Tarda unos segundos: no cierres esta ventana ni vuelvas a presionar."
                : "Estamos sumando tu recompensa."}
            </p>
          ) : (
            <p>Esto es lo que vas a recibir. Nada sale de tu bolsillo.</p>
          )}
          <dl className="transfer-summary">
            <div>
              <dt>Recibes</dt>
              <dd>
                {reward.units} {unit}
              </dd>
            </div>
            <div>
              <dt>Por qué</dt>
              <dd>
                {reward.label
                  ? `${why[reward.reason]} ${reward.label}.`
                  : why[reward.reason]}
              </dd>
            </div>
            <div>
              <dt>A dónde llega</dt>
              <dd>
                {live
                  ? `Tu cuenta digital${account ? ` (${account})` : ""}`
                  : "Tu cuenta de demostración"}
              </dd>
            </div>
            <div>
              <dt>Valor</dt>
              <dd>
                {live
                  ? "Activo de prueba, sin valor en dinero"
                  : "Unidad de demostración, sin valor en dinero"}
              </dd>
            </div>
            <div>
              <dt>Costo para ti</dt>
              <dd>$0 · Do-Own paga la comisión de la red</dd>
            </div>
          </dl>
          <p className="field-hint claim-note">
            <ShieldCheck size={15} />
            {live
              ? "No firmas nada con tu llave ni das permisos: solo aceptas recibir. La entrega queda en un registro público que puedes verificar."
              : "En la demo no se hace ninguna transferencia real."}
          </p>
          {error && (
            <p className="field-error" role="alert">
              No se entregó: {error}
            </p>
          )}
          <div className="confirm-actions">
            <Button variant="quiet" disabled={busy} onClick={onClose}>
              Ahora no
            </Button>
            <Button onClick={onConfirm} disabled={busy} aria-busy={busy}>
              {busy ? (
                <>
                  Confirmando…
                  <Loader2 size={17} className="spin" />
                </>
              ) : (
                <>
                  {error ? "Intentar de nuevo" : "Aceptar y recibir"}
                  <CheckCircle2 size={17} />
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </dialog>
  );
}
