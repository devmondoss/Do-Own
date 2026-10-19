"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Gift,
  KeyRound,
  Loader2,
  RefreshCw,
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
import { InstallCard } from "@/components/ui/install-card";
import { useDemo } from "@/providers/demo-provider";
import { formatDown, useWallet } from "@/providers/wallet-provider";
import { explorerAccount, explorerTx } from "@/lib/stellar/config";

const short = (id: string) => `${id.slice(0, 5)}…${id.slice(-5)}`;
const AMOUNT = /^\d{1,9}([.,]\d{1,7})?$/;

export function WalletAccount() {
  const { notify } = useDemo();
  const wallet = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<{ to: string; amount: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [sentHash, setSentHash] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [restoreValue, setRestoreValue] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const ready = wallet.status === "ready" && !!wallet.publicKey;
  const balance = Number(wallet.balance);

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      notify(`${label} copiada.`);
    } catch {
      notify("No se pudo copiar. Selecciona el texto manualmente.");
    }
  }

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const to = recipient.trim().toUpperCase();
    if (!/^G[A-Z2-7]{55}$/.test(to) || to === wallet.publicKey) {
      setError(
        "Escribe una cuenta Do-Own válida (empieza con G y tiene 56 caracteres), distinta de la tuya.",
      );
      return;
    }
    const clean = amount.replace(",", ".");
    if (!AMOUNT.test(amount) || Number(clean) <= 0 || Number(clean) > balance) {
      setError("Ingresa una cantidad mayor a cero que no supere tu saldo.");
      return;
    }
    setError("");
    setSentHash(null);
    setDraft({ to, amount: clean });
    dialog.current?.showModal();
  }

  async function confirm() {
    if (!draft || busy || sentHash) return;
    setBusy(true);
    try {
      const hash = await wallet.transfer(draft.to, draft.amount);
      setSentHash(hash);
      setAmount("");
    } catch (e) {
      dialog.current?.close();
      setError(e instanceof Error ? e.message : "No se pudo enviar.");
    } finally {
      setBusy(false);
    }
  }

  async function restore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await wallet.restore(restoreValue);
      setRestoreValue("");
      notify("Recuperaste tu cuenta en este dispositivo.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "No se pudo recuperar.");
    }
  }

  return (
    <main id="contenido" className="page account-page">
      <FlowHeader
        title="Mi cuenta digital"
        back="/progreso"
        action={
          <Badge tone={ready ? "mint" : "neutral"}>
            {ready ? "Activa" : "Prueba"}
          </Badge>
        }
      />
      <div className="account-grid">
        <div className="account-overview">
          <section className="balance-card account-balance">
            <div className="balance-meta">
              <span className="network-badge">
                <i />
                {ready ? "Cuenta activa" : "Cuenta por activar"}
              </span>
              <span className="wallet-icon">
                <Wallet size={22} />
              </span>
            </div>
            <p>Tus recompensas</p>
            <div className="balance-number">
              {formatDown(wallet.balance)}
              <span>DOWN</span>
            </div>
            <div className="balance-footer">
              <span>
                <ShieldCheck size={15} />
                Activo de prueba, sin dinero real
              </span>
              <Link href="/recompensa">
                Ver recompensas
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>

          {!ready ? (
            <Card className="account-identity">
              <span className="eyebrow">ACTIVA TU CUENTA</span>
              <p>
                Creamos una cuenta digital que vive en este dispositivo. No
                necesitas contraseña, frase secreta ni pagar comisiones: Do-Own
                las cubre por ti.
              </p>
              {wallet.error && (
                <p className="field-error" role="alert">
                  {wallet.error}
                </p>
              )}
              <Button
                className="full-width"
                disabled={wallet.status === "creating"}
                aria-busy={wallet.status === "creating"}
                onClick={() => void wallet.ensureAccount()}
              >
                {wallet.status === "creating" ? (
                  <>
                    Activando tu cuenta…
                    <Loader2 size={18} className="spin" />
                  </>
                ) : (
                  <>
                    Activar mi cuenta digital
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <Card className="account-identity">
              <span className="eyebrow">TU CUENTA PARA RECIBIR</span>
              <div>
                <code>{short(wallet.publicKey!)}</code>
                <button
                  className="text-link"
                  onClick={() => copy(wallet.publicKey!, "Cuenta")}
                >
                  <Copy size={16} />
                  Copiar
                </button>
              </div>
              <p>
                Comparte esta cuenta para que otra persona de Do-Own te envíe
                recompensas. Solo tú puedes mover lo que hay en ella.
              </p>
              <details className="technical-details">
                <summary>Detalles técnicos y respaldo</summary>
                <p className="field-hint">
                  Cuenta en Stellar Testnet creada con reservas patrocinadas por
                  Do-Own (saldo 0 XLM). Las comisiones se pagan con fee bump.
                </p>
                <code className="wallet-key">{wallet.publicKey}</code>
                <a
                  className="text-link"
                  href={explorerAccount(wallet.publicKey!)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver cuenta en el explorador <ExternalLink size={15} />
                </a>
                {wallet.onboardingTx && (
                  <a
                    className="text-link"
                    href={explorerTx(wallet.onboardingTx)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver operación de creación <ExternalLink size={15} />
                  </a>
                )}
                <p className="field-hint">
                  Tu clave de respaldo permite recuperar la cuenta en otro
                  dispositivo. Nunca la compartas: quien la tenga controla la
                  cuenta.
                </p>
                <Button
                  variant="quiet"
                  onClick={() => setShowSecret((v) => !v)}
                >
                  <KeyRound size={16} />
                  {showSecret
                    ? "Ocultar clave de respaldo"
                    : "Ver clave de respaldo"}
                </Button>
                {showSecret && (
                  <div className="hash-box">
                    <code>{wallet.backupSecret()}</code>
                    <button
                      className="text-link"
                      onClick={() =>
                        copy(wallet.backupSecret() ?? "", "Clave de respaldo")
                      }
                    >
                      <Copy size={16} />
                      Copiar
                    </button>
                  </div>
                )}
              </details>
            </Card>
          )}
          <InstallCard />
        </div>

        <Card className="transfer-card">
          <IconTile icon={Send} />
          <h2>Envía una recompensa</h2>
          <p>
            Regala parte de tus DOWN a otra persona de Do-Own. Revisa los datos
            y confirma: tú tienes la última palabra.
          </p>
          <form onSubmit={review} noValidate>
            <label htmlFor="recipient">Cuenta de destino</label>
            <input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="G…"
              maxLength={56}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              disabled={!ready}
            />
            <label htmlFor="transfer-amount">Cantidad de DOWN</label>
            <input
              id="transfer-amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1"
              maxLength={17}
              disabled={!ready}
            />
            <span className="field-hint">
              Disponible: {formatDown(wallet.balance)} DOWN · la comisión la
              cubre Do-Own
            </span>
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="full-width" disabled={!ready}>
              Revisar envío
              <ArrowRight size={18} />
            </Button>
          </form>
        </Card>

        <section className="account-activity">
          <SectionHeading>
            Movimientos
            {ready && (
              <button
                className="text-link"
                onClick={() => void wallet.refresh()}
                aria-label="Actualizar movimientos"
              >
                <RefreshCw size={15} />
              </button>
            )}
          </SectionHeading>
          {wallet.payments.length === 0 ? (
            <Card className="empty-state">
              <IconTile icon={ArrowDownLeft} tone="mint" />
              <p>
                Aquí verás tus recompensas y envíos. Registra una decisión para
                recibir la primera.
              </p>
            </Card>
          ) : (
            <div className="movement-list">
              {wallet.payments.map((p) => (
                <Card key={p.id} className="movement-row">
                  <IconTile
                    icon={
                      p.direction === "in"
                        ? p.fromSponsor
                          ? Gift
                          : ArrowDownLeft
                        : Send
                    }
                    tone={p.direction === "in" ? "mint" : "violet"}
                  />
                  <div>
                    <h3>
                      {p.direction === "out"
                        ? "Enviaste"
                        : p.fromSponsor
                          ? "Recompensa recibida"
                          : "Te enviaron"}
                    </h3>
                    <p>
                      <a
                        href={explorerTx(p.hash)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {new Date(p.createdAt).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </a>
                      {!p.fromSponsor && ` · ${short(p.counterparty)}`}
                    </p>
                  </div>
                  <strong>
                    {p.direction === "in" ? "+" : "−"}
                    {formatDown(p.amount)}
                  </strong>
                </Card>
              ))}
            </div>
          )}
        </section>

        {!ready && (
          <Card className="transfer-card">
            <IconTile icon={KeyRound} tone="neutral" />
            <h2>¿Ya tenías una cuenta?</h2>
            <p>
              Pega tu clave de respaldo para recuperarla en este dispositivo.
            </p>
            <form onSubmit={restore}>
              <label htmlFor="restore-secret">Clave de respaldo</label>
              <input
                id="restore-secret"
                value={restoreValue}
                onChange={(e) => setRestoreValue(e.target.value)}
                placeholder="S…"
                autoComplete="off"
                spellCheck={false}
              />
              <Button type="submit" variant="secondary" className="full-width">
                Recuperar mi cuenta
              </Button>
            </form>
          </Card>
        )}
      </div>

      <dialog
        ref={dialog}
        className="lesson-dialog transfer-dialog"
        aria-label="Confirmación del envío"
      >
        <div className="lesson-dialog-header">
          <Badge tone={sentHash ? "mint" : "violet"}>
            {sentHash ? "ENVÍO CONFIRMADO" : "REVISA TU ENVÍO"}
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
          icon={sentHash ? CheckCircle2 : Send}
          tone={sentHash ? "mint" : "violet"}
        />
        <h2>{sentHash ? "¡Enviado!" : "Tú tienes la última palabra"}</h2>
        <p>
          {sentHash
            ? "La otra persona ya puede ver tus DOWN en su cuenta."
            : "Vas a enviar recompensas desde tu cuenta. Esta acción no se puede deshacer."}
        </p>
        <dl className="transfer-summary">
          <div>
            <dt>Enviar</dt>
            <dd>{draft?.amount} DOWN</dd>
          </div>
          <div>
            <dt>A la cuenta</dt>
            <dd>{draft ? short(draft.to) : ""}</dd>
          </div>
          <div>
            <dt>Comisión</dt>
            <dd>La cubre Do-Own</dd>
          </div>
        </dl>
        {sentHash ? (
          <>
            <a
              className="text-link"
              href={explorerTx(sentHash)}
              target="_blank"
              rel="noreferrer"
            >
              Ver comprobante público <ExternalLink size={15} />
            </a>
            <Button
              className="full-width"
              onClick={() => dialog.current?.close()}
            >
              Volver a mi cuenta
              <CheckCircle2 size={18} />
            </Button>
          </>
        ) : (
          <div className="confirm-actions">
            <Button
              variant="quiet"
              disabled={busy}
              onClick={() => dialog.current?.close()}
            >
              Editar
            </Button>
            <Button onClick={confirm} disabled={busy} aria-busy={busy}>
              {busy ? "Enviando…" : "Confirmar envío"}
              {busy ? (
                <Loader2 size={17} className="spin" />
              ) : (
                <Send size={17} />
              )}
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
