"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  Send,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  FlowHeader,
  IconTile,
  SectionHeading,
} from "@/components/ui/primitives";
import { useDemo } from "@/providers/demo-provider";
import { handleTransferirRecompensa } from "@/lib/integrations";
import type { TransferInput } from "@/types/do-own";

export function AccountScreen() {
  const { data, transferDemo, notify } = useDemo();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<TransferInput | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const confirmed =
    !!draft &&
    data.transfers.some(
      (transfer) => transfer.idempotencyKey === draft.idempotencyKey,
    );
  const accountId = "DEMO-DOOWN-001";
  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !/^DEMO-[A-Z0-9-]{4,40}$/.test(recipient.trim().toUpperCase()) ||
      recipient.trim().toUpperCase() === accountId
    ) {
      setError(
        "Usa una cuenta de ejemplo distinta de la tuya, como DEMO-DESTINO-001.",
      );
      return;
    }
    if (
      !/^\d+$/.test(amount) ||
      !Number.isSafeInteger(Number(amount)) ||
      Number(amount) <= 0 ||
      Number(amount) > data.balanceUnits
    ) {
      setError(
        "Ingresa una cantidad entera mayor a cero que no supere tu saldo disponible.",
      );
      return;
    }
    setError("");
    setDraft({
      recipient: recipient.trim().toUpperCase(),
      amount: String(Number(amount)),
      idempotencyKey: crypto.randomUUID(),
    });
    dialog.current?.showModal();
  }
  function confirm() {
    if (!draft || confirmed) return;
    if (Number(draft.amount) > data.balanceUnits) {
      dialog.current?.close();
      setError("Tu saldo cambió. Revisa el monto antes de continuar.");
      return;
    }
    handleTransferirRecompensa(draft);
    // DEMO(UI): only the in-memory balance changes. No signature or network call.
    transferDemo(draft);
  }
  async function copyAccount() {
    try {
      await navigator.clipboard.writeText(accountId);
      notify("Cuenta de demostración copiada.");
    } catch {
      notify(
        "No se pudo copiar. Puedes seleccionar el identificador de la cuenta.",
      );
    }
  }
  return (
    <main id="contenido" className="page account-page">
      <FlowHeader
        title="Mi cuenta digital"
        back="/progreso"
        action={<Badge tone="neutral">Demo</Badge>}
      />
      <div className="account-grid">
        <div className="account-overview">
          <section className="balance-card account-balance">
            <div className="balance-meta">
              <span className="network-badge">
                <i />
                Cuenta de demostración
              </span>
              <span className="wallet-icon">
                <Wallet size={22} />
              </span>
            </div>
            <p>Tus recompensas disponibles</p>
            <div className="balance-number">
              {data.balanceUnits}
              <span>créditos</span>
            </div>
            <div className="balance-footer">
              <span>
                <ShieldCheck size={15} />
                Sin dinero real
              </span>
              <Link href="/recompensa">
                Ver recompensas
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>
          <Card className="account-identity">
            <span className="eyebrow">TU CUENTA DE EJEMPLO</span>
            <div>
              <code>{accountId}</code>
              <button className="text-link" onClick={copyAccount}>
                <Copy size={16} />
                Copiar
              </button>
            </div>
            <p>
              Practica cómo recibir y mover tus recompensas. Este identificador
              no corresponde a una cuenta real.
            </p>
          </Card>
        </div>
        <Card className="transfer-card">
          <IconTile icon={Send} />
          <h2>Envía una recompensa</h2>
          <p>
            Prueba un envío a otra cuenta. Revisa los datos y confirma antes de
            continuar.
          </p>
          <form onSubmit={review} noValidate>
            <label htmlFor="recipient">Cuenta de destino</label>
            <input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="DEMO-DESTINO-001"
              maxLength={45}
              autoComplete="off"
              aria-describedby="transfer-account-hint"
            />
            <button
              type="button"
              className="text-link"
              onClick={() => setRecipient("DEMO-DESTINO-001")}
            >
              Usar cuenta de ejemplo
            </button>
            <p id="transfer-account-hint" className="field-hint">
              En esta demo solo se admiten identificadores de ejemplo que
              empiezan por DEMO-.
            </p>
            <label htmlFor="transfer-amount">Cantidad de créditos</label>
            <input
              id="transfer-amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10"
              maxLength={9}
            />
            <span className="field-hint">
              Disponible: {data.balanceUnits} créditos de demostración
            </span>
            {error && (
              <p className="field-error" id="transfer-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="full-width">
              Revisar envío
              <ArrowRight size={18} />
            </Button>
          </form>
        </Card>
        <section className="account-activity">
          <SectionHeading>Movimientos de la sesión</SectionHeading>
          {data.transfers.length === 0 ? (
            <Card className="empty-state">
              <IconTile icon={ArrowDownLeft} tone="mint" />
              <p>
                Todavía no has realizado envíos. Puedes practicar con la cuenta
                de ejemplo.
              </p>
            </Card>
          ) : (
            <div className="movement-list">
              {data.transfers.map((transfer) => (
                <Card key={transfer.idempotencyKey} className="movement-row">
                  <IconTile icon={Send} />
                  <div>
                    <h3>Envío simulado</h3>
                    <p>{transfer.recipient}</p>
                  </div>
                  <strong>−{transfer.amount}</strong>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
      <dialog
        ref={dialog}
        className="lesson-dialog transfer-dialog"
        aria-label="Confirmación del envío"
      >
        <div className="lesson-dialog-header">
          <Badge tone={confirmed ? "mint" : "violet"}>
            {confirmed ? "ENVÍO SIMULADO" : "REVISA TU ENVÍO"}
          </Badge>
          <button
            className="icon-button"
            aria-label="Cerrar confirmación"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <IconTile
          icon={confirmed ? CheckCircle2 : Send}
          tone={confirmed ? "mint" : "violet"}
        />
        <h2>
          {confirmed ? "¡Listo en tu demo!" : "Tú tienes la última palabra"}
        </h2>
        <p>
          {confirmed
            ? "Tu saldo de demostración se actualizó. No se movió dinero real."
            : "Esto es lo que vas a simular. Puedes volver a editarlo si algo no coincide."}
        </p>
        <dl className="transfer-summary">
          <div>
            <dt>Enviar</dt>
            <dd>{draft?.amount} créditos</dd>
          </div>
          <div>
            <dt>A la cuenta</dt>
            <dd>{draft?.recipient}</dd>
          </div>
          <div>
            <dt>Operación</dt>
            <dd>Solo demostración</dd>
          </div>
        </dl>
        {confirmed ? (
          <Button
            className="full-width"
            onClick={() => {
              dialog.current?.close();
              setAmount("");
            }}
          >
            Volver a mi cuenta
            <CheckCircle2 size={18} />
          </Button>
        ) : (
          <div className="confirm-actions">
            <Button variant="quiet" onClick={() => dialog.current?.close()}>
              Editar
            </Button>
            <Button onClick={confirm}>
              Confirmar envío simulado
              <Send size={17} />
            </Button>
          </div>
        )}
      </dialog>
      <ButtonLink href="/progreso" variant="quiet">
        Volver a mi progreso
      </ButtonLink>
    </main>
  );
}
