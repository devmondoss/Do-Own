"use client";

import { useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Info,
  Loader2,
  Lock,
  Share2,
  ShieldCheck,
} from "lucide-react";
import {
  Badge,
  Button,
  ButtonLink,
  FlowHeader,
  IconTile,
} from "@/components/ui/primitives";
import { demoProof } from "@/data/mock-data";
import { useDemo } from "@/providers/demo-provider";
import { handleVerExplorer } from "@/lib/integrations";
import { useWallet } from "@/providers/wallet-provider";

export function ProofScreen() {
  const { data, notify } = useDemo();
  const wallet = useWallet();
  const live = wallet.enabled;
  const seal = live ? wallet.seals[0] : undefined;
  const [copied, setCopied] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verdict, setVerdict] = useState<string>("");
  const [sealError, setSealError] = useState("");
  const proof = seal
    ? {
        ...demoProof,
        title: "Cierre semanal",
        habit: "Registro consciente de decisiones",
        completedDays: seal.records,
        totalDays: seal.records,
        memoHashDisplay: `${seal.root.slice(0, 6)}…${seal.root.slice(-4)}`,
        memoHashFull: seal.root,
        timestamp: seal.createdAt,
        transactionHash: seal.transactionHash,
      }
    : demoProof;
  const verifyUrl = seal
    ? `/verificar?tx=${seal.transactionHash}&root=${seal.root}`
    : "/comprobante";

  async function sealNow() {
    if (sealing) return;
    setSealing(true);
    setSealError("");
    setVerdict("");
    try {
      await wallet.sealWeek(data.decisions);
      notify("Tu semana quedó sellada. Nadie puede reescribirla.");
    } catch (e) {
      setSealError(
        e instanceof Error ? e.message : "No pudimos sellar tu semana.",
      );
    } finally {
      setSealing(false);
    }
  }

  async function verify() {
    if (!seal || verifying) return;
    setVerifying(true);
    try {
      const lib = await import("@/lib/stellar/client");
      const onChain = await lib.verifyAnchor(seal.transactionHash, seal.root);
      let local = "";
      const session = wallet.sessionSeal;
      if (session && session.root === seal.root) {
        const commitments = [];
        for (const item of session.sealed) {
          const record = data.decisions.find((d) => d.id === item.id);
          if (!record) break;
          commitments.push(await lib.recomputeCommitment(record, item.salt));
        }
        if (commitments.length === session.sealed.length) {
          const root = await lib.merkleRoot(commitments);
          local =
            root === seal.root
              ? ` Tus ${commitments.length} registros coinciden con el sello.`
              : " Tus registros ya no coinciden con el sello.";
        }
      }
      setVerdict(
        onChain.matches
          ? `Verificado: el sello público coincide.${local}`
          : "El sello público no coincide con este comprobante.",
      );
    } catch (e) {
      setVerdict(e instanceof Error ? e.message : "No se pudo verificar.");
    } finally {
      setVerifying(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(proof.memoHashFull);
      setCopied(true);
      notify(seal ? "Sello copiado." : "Sello de demostración copiado.");
    } catch {
      notify(
        "No se pudo copiar. Puedes seleccionar el sello y copiarlo manualmente.",
      );
    }
  }
  async function share() {
    const shareData = {
      title: "Mi constancia · Do-Own",
      text: seal
        ? `Registré ${seal.records} decisiones esta semana con Do-Own. Cualquiera puede verificar mi constancia, sin ver mis datos:`
        : "Estoy construyendo mis hábitos financieros con Do-Own. Este es mi comprobante de demostración.",
      url: `${window.location.origin}${verifyUrl}`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError"))
          notify("No se pudo compartir. Inténtalo de nuevo.");
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`,
        );
        notify(
          seal
            ? "Enlace de verificación copiado."
            : "Enlace de demostración copiado para compartir.",
        );
      } catch {
        notify(
          "Tu navegador no permite compartir. Copia la URL de esta página.",
        );
      }
    }
  }
  return (
    <main id="contenido" className="flow-page proof-page">
      <FlowHeader
        title="Tu comprobante"
        back="/progreso"
        action={
          <span
            className="proof-status-dot"
            role="img"
            aria-label="Comprobante de demostración"
          />
        }
      />
      <div className="proof-body">
        {live && (
          <section className="card seal-card">
            <IconTile icon={Lock} tone="mint" />
            <div>
              <h2>{seal ? "Sella de nuevo tu semana" : "Sella tu semana"}</h2>
              <p>
                Guardamos una huella de tus {data.decisions.length} registros
                para que nadie pueda reescribirlos. Tus montos, notas y
                emociones no salen de tu dispositivo.
              </p>
              {sealError && (
                <p className="field-error" role="alert">
                  {sealError}
                </p>
              )}
            </div>
            <Button
              className="full-width"
              onClick={sealNow}
              disabled={sealing || data.decisions.length === 0}
              aria-busy={sealing}
            >
              {sealing ? (
                <>
                  Sellando…
                  <Loader2 size={18} className="spin" />
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Sellar mi semana
                </>
              )}
            </Button>
          </section>
        )}
        <section className="certificate">
          <div className="certificate-top">
            <Badge tone="mint">
              <CheckCircle2 size={16} />
              Constancia registrada{" "}
              {!seal && <span className="verified-demo">· Demo</span>}
            </Badge>
            <div className="certificate-title">
              <h2>{proof.title}</h2>
              <p>Resumen de constancia semanal</p>
            </div>
            <div className="habit-row">
              <IconTile icon={CalendarDays} />
              <div>
                <span>Hábito financiero</span>
                <strong>{proof.habit}</strong>
              </div>
              <Badge tone="mint">
                {seal
                  ? `${seal.records} registros`
                  : `${proof.completedDays}/${proof.totalDays} días`}
              </Badge>
            </div>
          </div>
          <div className="ticket-tear" aria-hidden="true">
            <i />
            <span />
            <i />
          </div>
          <div className="certificate-bottom">
            <details className="technical-details">
              <summary>Ver detalles de verificación</summary>
              <p className="field-hint">
                {seal
                  ? "Raíz Merkle de tus registros con sal, anclada como memo hash en una transacción de Stellar Testnet. La comisión la pagó Do-Own (fee bump)."
                  : "Este sello y la red son de ejemplo. Todavía no hay una operación real para verificar."}
              </p>
              <p className="hash-label">Sello de Integridad (Memo Hash):</p>
              <div className="hash-box">
                <code id="memo-hash">{proof.memoHashDisplay}</code>
                <button className="text-link" onClick={copy}>
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <div className="certificate-metadata">
                <div>
                  <span>
                    <i className="status-dot violet-dot" />
                    Red anclada
                  </span>
                  <strong>Stellar Testnet</strong>
                </div>
                <div>
                  <span>
                    <Clock3 size={14} />
                    Estampa de tiempo
                  </span>
                  <time dateTime={proof.timestamp}>
                    {new Date(proof.timestamp).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                    <br />
                    {new Date(proof.timestamp).toLocaleTimeString("es-MX", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "UTC",
                    })}{" "}
                    UTC
                  </time>
                </div>
              </div>
              {seal ? (
                <>
                  <a
                    className="button button-quiet full-width"
                    href={`https://stellar.expert/explorer/testnet/tx/${seal.transactionHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver en Stellar Explorer
                    <ExternalLink size={18} />
                  </a>
                  <Button
                    variant="secondary"
                    className="full-width"
                    onClick={verify}
                    disabled={verifying}
                  >
                    <ShieldCheck size={18} />
                    {verifying ? "Verificando…" : "Verificar ahora"}
                  </Button>
                  {verdict && (
                    <p className="field-hint" role="status">
                      {verdict}
                    </p>
                  )}
                </>
              ) : (
                <Button
                  variant="quiet"
                  className="full-width"
                  onClick={() => {
                    handleVerExplorer();
                    notify(
                      "Este comprobante es de muestra. Sella tu semana para obtener uno con una transacción real.",
                    );
                  }}
                >
                  Ver en Stellar Explorer
                  <ExternalLink size={18} />
                </Button>
              )}
            </details>
          </div>
        </section>
        <aside className="proof-explanation">
          <IconTile icon={Info} />
          <p>
            Este comprobante resume tu constancia. Tus montos, decisiones y
            emociones permanecen privados.
          </p>
        </aside>
        {!seal && (
          <p className="proof-demo-note">
            Comprobante de muestra · sin verificación real
          </p>
        )}
      </div>
      <footer className="proof-footer">
        <ButtonLink variant="outline" className="full-width" href="/reflexion">
          Ver mi reflexión semanal
        </ButtonLink>
        <Button className="full-width" onClick={share}>
          <Share2 size={18} />
          Compartir logro
        </Button>
      </footer>
    </main>
  );
}
