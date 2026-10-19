"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { Card, IconTile } from "./primitives";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Offers to install Do-Own on the phone's home screen (PWA).
 * Android/Chrome: native prompt. iPhone/Safari: short instructions. */
export function InstallCard() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [android, setAndroid] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser-only state once
    setInstalled(standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setAndroid(/android/i.test(navigator.userAgent));
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;
  return (
    <Card className="account-identity install-card">
      <IconTile icon={Smartphone} tone="mint" />
      <span className="eyebrow">LLÉVALA EN TU TELÉFONO</span>
      {!ios && (
        <>
          <p>
            Descarga la app de Do-Own para Android e instálala como cualquier
            otra app.
          </p>
          <a
            className="button button-primary full-width"
            href="/Do-Own.apk"
            download="Do-Own.apk"
          >
            <Download size={18} />
            Descargar app para Android
          </a>
          {android && (
            <p className="field-hint">
              Al abrir el archivo, permite &quot;instalar apps de origen
              desconocido&quot; si tu teléfono lo pide.
            </p>
          )}
        </>
      )}
      {prompt && (
        <button
          className="text-link"
          onClick={async () => {
            await prompt.prompt();
            await prompt.userChoice;
            setPrompt(null);
          }}
        >
          O instálala desde el navegador
        </button>
      )}
      {ios && (
        <p>
          En Safari, toca <strong>Compartir</strong> y luego{" "}
          <strong>Agregar a pantalla de inicio</strong>.
        </p>
      )}
    </Card>
  );
}
