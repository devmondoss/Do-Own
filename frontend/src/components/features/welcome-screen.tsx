"use client";

import { useState, type FormEvent } from "react";
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

export function WelcomeScreen() {
  const [name, setName] = useState("");
  const { startDemo } = useDemo();
  const router = useRouter();
  function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleCrearPerfil();
    // DEMO(UI): no real account or authentication is created.
    startDemo(name);
    router.push("/inicio");
  }
  return (
    <main id="contenido" className="welcome-page">
      <header>
        <Brand />
        <Badge tone="neutral">Demo interactiva</Badge>
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
                <strong>Observa</strong>Registra una decisión con una foto o de
                forma manual.
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
          <form onSubmit={start}>
            <label htmlFor="welcome-name">
              ¿Cómo te llamamos? <span>(opcional)</span>
            </label>
            <input
              id="welcome-name"
              autoComplete="given-name"
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ana"
            />
            <Button type="submit" className="full-width">
              Comenzar mi recorrido
              <ArrowRight size={18} />
            </Button>
          </form>
          <p className="welcome-privacy">
            <ShieldCheck size={17} />
            No necesitas datos financieros sensibles. Esta demo guarda los
            cambios solo durante la sesión y se reinicia al recargar.
          </p>
        </section>
      </div>
    </main>
  );
}
