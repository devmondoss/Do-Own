"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  Badge,
  Brand,
  ButtonLink,
  Card,
  IconTile,
} from "@/components/ui/primitives";

type Result =
  | { state: "loading" }
  | { state: "invalid" }
  | { state: "error"; message: string }
  | {
      state: "done";
      matches: boolean;
      ledger: number;
      createdAt: string;
      account: string;
      explorerUrl: string;
    };

/** Public page anyone can open from a shared link. It reads the transaction
 * directly from the public network and compares its memo hash with the root
 * in the link. It never sees amounts, notes or emotions. */
export function VerifyScreen() {
  const params = useSearchParams();
  const tx = params.get("tx") ?? "";
  const root = (params.get("root") ?? "").toLowerCase();
  const valid = /^[0-9a-f]{64}$/i.test(tx) && /^[0-9a-f]{64}$/.test(root);
  const [result, setResult] = useState<Result>({ state: "loading" });

  useEffect(() => {
    if (!valid) return;
    let cancelled = false;
    import("@/lib/stellar/client")
      .then((lib) => lib.verifyAnchor(tx, root))
      .then((r) => !cancelled && setResult({ state: "done", ...r }))
      .catch(
        (e) =>
          !cancelled &&
          setResult({
            state: "error",
            message: e instanceof Error ? e.message : "No se pudo verificar.",
          }),
      );
    return () => {
      cancelled = true;
    };
  }, [root, tx, valid]);

  const shown: Result = valid ? result : { state: "invalid" };
  return (
    <main id="contenido" className="welcome-page verify-page">
      <header>
        <Brand />
        <Badge tone="neutral">Verificación pública</Badge>
      </header>
      <div className="verify-body">
        <h1>Constancia Do-Own</h1>
        <Card className="verify-card">
          {shown.state === "loading" && (
            <>
              <Loader2 size={32} className="spin" />
              <p>Consultando la red pública…</p>
            </>
          )}
          {shown.state === "invalid" && (
            <>
              <IconTile icon={ShieldAlert} tone="amber" />
              <p>El enlace de verificación está incompleto.</p>
            </>
          )}
          {shown.state === "error" && (
            <>
              <IconTile icon={ShieldAlert} tone="amber" />
              <p>{shown.message}</p>
            </>
          )}
          {shown.state === "done" && (
            <>
              <IconTile
                icon={shown.matches ? ShieldCheck : ShieldAlert}
                tone={shown.matches ? "mint" : "rose"}
              />
              <h2>
                {shown.matches
                  ? "El cierre semanal es auténtico"
                  : "El sello no coincide"}
              </h2>
              <p>
                {shown.matches
                  ? "Este resumen se registró en la fecha indicada y no ha sido modificado desde entonces. Los montos, notas y emociones de la persona siguen siendo privados."
                  : "La operación existe, pero su sello no corresponde a este comprobante."}
              </p>
              <dl className="transfer-summary">
                <div>
                  <dt>Registrado</dt>
                  <dd>
                    {new Date(shown.createdAt).toLocaleString("es-MX", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </dd>
                </div>
                <div>
                  <dt>Bloque</dt>
                  <dd>{shown.ledger}</dd>
                </div>
              </dl>
              <details className="technical-details">
                <summary>Ver detalles técnicos</summary>
                <p className="field-hint">
                  Memo hash de la transacción en Stellar Testnet comparado con
                  la raíz Merkle del enlace.
                </p>
                <code className="wallet-key">{root}</code>
                <a
                  className="text-link"
                  href={shown.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir en el explorador <ExternalLink size={15} />
                </a>
              </details>
              {shown.matches && (
                <Badge tone="mint">
                  <CheckCircle2 size={16} /> Verificado
                </Badge>
              )}
            </>
          )}
        </Card>
        <ButtonLink href="/bienvenida" variant="secondary">
          Conocer Do-Own
        </ButtonLink>
      </div>
    </main>
  );
}
