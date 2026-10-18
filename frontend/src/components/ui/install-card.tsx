"use client";

import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import { Button, Card, IconTile } from "./primitives";

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

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser-only state once
    setInstalled(standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
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

  if (installed || (!prompt && !ios)) return null;
  return (
    <Card className="account-identity install-card">
      <IconTile icon={Smartphone} tone="mint" />
      <span className="eyebrow">LLÉVALA EN TU TELÉFONO</span>
      {prompt ? (
        <>
          <p>Instala Do-Own en tu pantalla de inicio y ábrela como una app.</p>
          <Button
            className="full-width"
            onClick={async () => {
              await prompt.prompt();
              await prompt.userChoice;
              setPrompt(null);
            }}
          >
            Instalar Do-Own
          </Button>
        </>
      ) : (
        <p>
          En Safari, toca <strong>Compartir</strong> y luego{" "}
          <strong>Agregar a pantalla de inicio</strong>.
        </p>
      )}
    </Card>
  );
}
