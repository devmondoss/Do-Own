"use client";

import { forwardRef, useState } from "react";
import { Copy, KeyRound, LogOut, TriangleAlert, X } from "lucide-react";
import { Button, IconTile } from "./primitives";
import { useWallet } from "@/providers/wallet-provider";
import { clearAllEvidence } from "@/lib/evidence-store";

// Everything Do-Own keeps on this device. Signing out removes all of it.
const DEVICE_KEYS = [
  "do-own.state.v1",
  "do-own.wallet.v1",
  "do-own.seals.v1",
  "do-own.rewards.v1",
  "do-own.avatar.v1",
  "do-own.draft.v1",
];

/** Sign-out confirmation. Data lives only on this device, so before erasing
 * it we show the backup key: it is the only way to recover the account and
 * its DOWN later (Mi cuenta → "¿Ya tenías una cuenta?"). */
export const LogoutDialog = forwardRef<HTMLDialogElement>(
  function LogoutDialog(_props, ref) {
    const wallet = useWallet();
    const secret = wallet.backupSecret();
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);
    const [show, setShow] = useState(false);

    function close() {
      if (ref && typeof ref !== "function") ref.current?.close();
    }

    async function copy() {
      if (!secret) return;
      try {
        await navigator.clipboard.writeText(secret);
        setCopied(true);
      } catch {
        setShow(true);
      }
    }

    function signOut() {
      for (const key of DEVICE_KEYS) {
        try {
          window.localStorage.removeItem(key);
        } catch {
          /* ignore */
        }
      }
      // Evidence photos live in IndexedDB on this device.
      clearAllEvidence();
      // Full reload so every provider starts from a clean state.
      window.location.replace("/bienvenida");
    }

    return (
      <dialog
        ref={ref}
        className="lesson-dialog logout-dialog"
        aria-label="Cerrar sesión"
      >
        <div className="lesson-dialog-header">
          <h2>Cerrar sesión</h2>
          <button className="icon-button" aria-label="Cancelar" onClick={close}>
            <X size={20} />
          </button>
        </div>
        <IconTile icon={TriangleAlert} tone="amber" />
        <p>
          Al salir se borran de este teléfono tu nombre, tus registros, tu foto
          y tu cuenta digital.
        </p>
        {secret ? (
          <>
            <p>
              <strong>Guarda primero tu clave de respaldo.</strong> Con ella
              recuperas tu cuenta y tus DOWN en{" "}
              <em>Mi cuenta → ¿Ya tenías una cuenta?</em>
            </p>
            <div className="logout-key">
              <Button variant="secondary" onClick={copy}>
                <Copy size={16} />
                {copied ? "Clave copiada" : "Copiar clave de respaldo"}
              </Button>
              <button className="text-link" onClick={() => setShow((v) => !v)}>
                <KeyRound size={15} />
                {show ? "Ocultar clave" : "Ver clave"}
              </button>
              {show && <code className="wallet-key">{secret}</code>}
            </div>
            <label className="logout-confirm">
              <input
                type="checkbox"
                checked={saved}
                onChange={(e) => setSaved(e.target.checked)}
              />
              Ya guardé mi clave en un lugar seguro
            </label>
          </>
        ) : (
          <p className="field-hint">
            Este teléfono todavía no tiene una cuenta digital activa.
          </p>
        )}
        <div className="confirm-actions">
          <Button variant="quiet" onClick={close}>
            Cancelar
          </Button>
          <Button onClick={signOut} disabled={!!secret && !saved}>
            <LogOut size={17} />
            Cerrar sesión
          </Button>
        </div>
      </dialog>
    );
  },
);
