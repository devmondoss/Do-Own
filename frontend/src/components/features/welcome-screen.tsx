"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Heart,
  Leaf,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge, Brand, Button, IconTile } from "@/components/ui/primitives";
import { useDemo } from "@/providers/demo-provider";
import { handleCrearPerfil } from "@/lib/integrations";
import { useWallet } from "@/providers/wallet-provider";

export function WelcomeScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const { startDemo, data, live, hydrated } = useDemo();
  const { enabled, ensureAccount } = useWallet();
  const router = useRouter();
  const alreadySetUp =
    live && hydrated && data.onboardingComplete && !!data.profile.name.trim();
  useEffect(() => {
    if (alreadySetUp) router.replace("/inicio");
  }, [alreadySetUp, router]);
  function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const nameBad = cleanName.length < 2;
    const emailBad =
      !!cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail);
    setNameError(
      nameBad ? "Escribe tu nombre (al menos 2 letras) para comenzar." : "",
    );
    setEmailError(
      emailBad
        ? "Revisa tu correo (por ejemplo, ana@correo.com) o déjalo vacío."
        : "",
    );
    if (nameBad || emailBad) {
      document
        .getElementById(nameBad ? "welcome-name" : "welcome-email")
        ?.focus();
      return;
    }
    handleCrearPerfil();
    // DEMO(UI): no real account or authentication is created.
    startDemo(cleanName, cleanEmail || undefined);
    // Creates the device key and the sponsored account in the background,
    // so the first reward can be delivered without waiting here.
    if (enabled) void ensureAccount();
    router.push("/inicio");
  }
  return (
    <main id="contenido" className="welcome-page">
      <header>
        <Brand />
        <Badge tone="neutral">
          {enabled ? "Versión de prueba" : "Demo interactiva"}
        </Badge>
      </header>
      <div className="welcome-layout">
        <section className="welcome-hero">
          <div className="welcome-symbol" aria-hidden="true">
            <Leaf size={68} strokeWidth={1.5} />
            <Sparkles size={29} />
          </div>
          <span className="eyebrow">TU PROGRESO ES TUYO</span>
          <h1>
            Empieza por una
            <br />
            pequeña decisión.
          </h1>
          <p>
            Observa cómo gastas, escucha cómo te sientes y aprende algo sobre
            ti. Sin juicios, a tu ritmo.
          </p>
        </section>
        <section className="card welcome-form">
          <h2>Un recorrido para ti</h2>
          <div className="welcome-steps">
            <div>
              <IconTile icon={Camera} />
              <p>
                <strong>Observa</strong>Registra una decisión con la foto de tu
                compra y su monto.
              </p>
            </div>
            <div>
              <IconTile icon={Heart} tone="rose" />
              <p>
                <strong>Conecta</strong>Asocia una emoción y empieza a ver tus
                patrones.
              </p>
            </div>
            <div>
              <IconTile icon={BookOpen} tone="mint" />
              <p>
                <strong>Aprende y celebra</strong>Completa una microlección y
                recibe recompensas.
              </p>
            </div>
          </div>
          <form onSubmit={start} noValidate>
            <label htmlFor="welcome-name">¿Cómo te llamamos?</label>
            <input
              id="welcome-name"
              autoComplete="given-name"
              maxLength={40}
              required
              aria-required="true"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              placeholder="Tu nombre"
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "welcome-name-error" : undefined}
            />
            {nameError && (
              <p className="field-error" role="alert" id="welcome-name-error">
                {nameError}
              </p>
            )}
            <label htmlFor="welcome-email">
              Tu correo <span>(opcional)</span>
            </label>
            <input
              id="welcome-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={80}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              placeholder="ana@correo.com"
              aria-invalid={!!emailError}
              aria-describedby="welcome-email-hint"
            />
            {emailError ? (
              <p className="field-error" role="alert" id="welcome-email-hint">
                {emailError}
              </p>
            ) : (
              <span className="field-hint" id="welcome-email-hint">
                Solo se guarda en este dispositivo. No te enviaremos nada.
              </span>
            )}
            <Button type="submit" className="full-width">
              Comenzar mi recorrido
              <ArrowRight size={18} />
            </Button>
          </form>
          {enabled && (
            <Link className="text-link welcome-restore" href="/cuenta">
              ¿Ya tenías una cuenta? Recupérala con tu clave
            </Link>
          )}
          <p className="welcome-privacy">
            <ShieldCheck size={17} />
            {enabled
              ? "No necesitas datos financieros sensibles. Tu cuenta digital se crea en este dispositivo, sin contraseñas ni costos."
              : "No necesitas datos financieros sensibles. Esta demo guarda los cambios solo durante la sesión y se reinicia al recargar."}
          </p>
        </section>
      </div>
    </main>
  );
}
