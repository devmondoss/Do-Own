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
  Share2,
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

export function ProofScreen() {
  const { notify } = useDemo();
  const [copied, setCopied] = useState(false);
  // TODO(STELLAR): replace demoProof with a confirmed server-issued HabitProof.
  const proof = demoProof;
  async function copy() {
    try {
      await navigator.clipboard.writeText(proof.memoHashFull);
      setCopied(true);
      notify("Sello de demostración copiado.");
    } catch {
      notify(
        "No se pudo copiar. Puedes seleccionar el sello y copiarlo manualmente.",
      );
    }
  }
  async function share() {
    const shareData = {
      title: "Mi constancia · Do-Own",
      text: "Estoy construyendo mis hábitos financieros con Do-Own. Este es mi comprobante de demostración.",
      url: `${window.location.origin}/comprobante`,
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
        notify("Enlace de demostración copiado para compartir.");
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
        <section className="certificate">
          <div className="certificate-top">
            <Badge tone="mint">
              <CheckCircle2 size={16} />
              Constancia registrada{" "}
              <span className="verified-demo">· Demo</span>
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
                {proof.completedDays}/{proof.totalDays} días
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
                Este sello y la red son de ejemplo. Todavía no hay una operación
                real para verificar.
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
                    15 oct 2026
                    <br />
                    15:30 UTC
                  </time>
                </div>
              </div>
              <Button
                variant="quiet"
                className="full-width"
                onClick={() => {
                  handleVerExplorer();
                  notify(
                    "Este comprobante es de muestra. La verificación se habilitará al conectar una transacción real.",
                  );
                }}
              >
                Ver en Stellar Explorer
                <ExternalLink size={18} />
              </Button>
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
        <p className="proof-demo-note">
          Comprobante de muestra · sin verificación real
        </p>
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
