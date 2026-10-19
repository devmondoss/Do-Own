"use client";

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  IceCreamBowl,
  LockKeyhole,
  NotebookPen,
  PiggyBank,
  ShoppingBag,
  Sparkles,
  Camera,
  X,
} from "lucide-react";
import {
  Badge,
  Button,
  FlowHeader,
  IconTile,
  cn,
} from "@/components/ui/primitives";
import { useDemo } from "@/providers/demo-provider";
import { handleAnalizarFoto, handleGuardarDecision } from "@/lib/integrations";
import type { DecisionCategory, Emotion } from "@/types/do-own";

const categories = [
  {
    value: "antojo" as const,
    title: "Antojo",
    subtitle: "Espontáneo",
    icon: IceCreamBowl,
  },
  {
    value: "habitual" as const,
    title: "Lo de siempre",
    subtitle: "Frecuente",
    icon: ShoppingBag,
  },
  {
    value: "ahorro" as const,
    title: "Guardé",
    subtitle: "Ahorro",
    icon: PiggyBank,
  },
];
const emotions = [
  {
    value: "tranquilo" as const,
    title: "Tranquilo",
    subtitle: "Satisfecho",
    emoji: "😊",
  },
  {
    value: "estres" as const,
    title: "Estrés",
    subtitle: "O culpa",
    emoji: "🙁",
  },
  {
    value: "rutina" as const,
    title: "Rutina",
    subtitle: "Neutro",
    emoji: "😌",
  },
];

export function RegisterScreen() {
  const router = useRouter();
  const { saveDecision, notify, live } = useDemo();
  const [amount, setAmount] = useState("250.00");
  const [category, setCategory] = useState<DecisionCategory>("antojo");
  const [emotion, setEmotion] = useState<Emotion>("tranquilo");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [photoError, setPhotoError] = useState("");
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      setPhotoError("Elige una imagen JPG, PNG o WebP de hasta 10 MB.");
      return;
    }
    setPhotoError("");
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    handleAnalizarFoto(file);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = amount.trim().replace(",", ".");
    if (
      !/^\d+(\.\d{1,2})?$/.test(normalized) ||
      Number(normalized) <= 0 ||
      Number(normalized) > 999999999
    ) {
      setError(
        "Ingresa un monto mayor a 0, con un máximo de 2 decimales y hasta 999,999,999 MXN.",
      );
      return;
    }
    setError("");
    const input = {
      amount: normalized,
      currency: "MXN" as const,
      category,
      emotion,
      note: note.trim(),
      ...(photo ? { attachment: photo } : {}),
    };
    handleGuardarDecision(input);
    // DEMO(UI): mark steps in memory, never claim these were saved on a server.
    // TODO(BACKEND): await success, handle errors/loading and only then navigate.
    saveDecision(input);
    notify(
      live
        ? "Decisión registrada. Tienes una recompensa disponible."
        : "Decisión registrada en la demo. Tienes una recompensa disponible.",
    );
    router.push("/recompensa");
  }
  return (
    <main id="contenido" className="flow-page register-page">
      <FlowHeader
        title="Registra tu decisión"
        action={
          <Badge tone="mint">
            <Sparkles size={14} />
            +75 pts
          </Badge>
        }
      />
      <form onSubmit={submit} noValidate>
        <div className="register-summary">
          <section className="photo-capture">
            <div className="photo-heading">
              <IconTile icon={Camera} />
              <div>
                <h2>Observa tu decisión</h2>
                <p>Agrega una foto o registra los datos manualmente.</p>
              </div>
            </div>
            <label className="photo-picker">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                aria-label="Agregar foto de tu decisión"
                onChange={selectPhoto}
              />
              <Camera size={20} />
              {photo ? "Cambiar foto" : "Tomar o elegir una foto"}
            </label>
            {preview && (
              <div className="photo-preview">
                <Image
                  src={preview}
                  alt="Vista previa de tu decisión"
                  width={360}
                  height={210}
                  unoptimized
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Quitar foto"
                  onClick={() => {
                    setPhoto(null);
                    setPreview("");
                  }}
                >
                  <X size={17} />
                </button>
              </div>
            )}
            {photoError && (
              <p className="field-error" role="alert">
                {photoError}
              </p>
            )}
            <p className="field-hint">
              {photo
                ? "Foto lista. Confirma el monto y la categoría manualmente: la lectura automática aún no está conectada."
                : "JPG, PNG o WebP · hasta 10 MB. La foto no se sube en esta demo."}
            </p>
          </section>
          <section className="amount-card">
            <label htmlFor="amount" className="eyebrow">
              MONTO DE TU DECISIÓN
            </label>
            <div className="amount-input-row">
              <span aria-hidden="true">$</span>
              <input
                id="amount"
                name="amount"
                inputMode="decimal"
                autoComplete="off"
                maxLength={13}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError("");
                }}
                aria-describedby={error ? "amount-error" : "amount-hint"}
                aria-invalid={!!error}
                aria-label="Monto en pesos mexicanos"
              />
              <span className="currency-label">MXN</span>
            </div>
            <span id="amount-hint" className="account-currency">
              <i className="status-dot" />
              Cuenta principal (MXN)
              <ChevronDown size={14} />
            </span>
          </section>
          {error && (
            <p className="field-error" id="amount-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <fieldset className="selection-fieldset category-fieldset">
          <legend>¿Qué tipo de decisión fue?</legend>
          <span className="fieldset-hint">Elige una</span>
          <div className="selection-grid">
            {categories.map(({ value, title, subtitle, icon: Icon }) => (
              <label
                key={value}
                className={cn(
                  "selection-card",
                  category === value && "selection-active",
                )}
              >
                <input
                  type="radio"
                  name="category"
                  value={value}
                  checked={category === value}
                  onChange={() => setCategory(value)}
                />
                <span className="selection-icon">
                  <Icon size={24} strokeWidth={1.8} />
                </span>
                <strong>{title}</strong>
                <span>{subtitle}</span>
                {category === value && (
                  <Check size={12} className="selection-check" />
                )}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset id="emocion" className="selection-fieldset emotion-fieldset">
          <legend>¿Cómo te sientes al respecto?</legend>
          <div className="selection-grid">
            {emotions.map(({ value, title, subtitle, emoji }) => (
              <label
                key={value}
                className={cn(
                  "selection-card emotion-card",
                  emotion === value && "selection-active",
                )}
              >
                <input
                  type="radio"
                  name="emotion"
                  value={value}
                  checked={emotion === value}
                  onChange={() => setEmotion(value)}
                />
                <span className="emotion-emoji" aria-hidden="true">
                  {emoji}
                </span>
                <strong>{title}</strong>
                <span>{subtitle}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="note-field">
          <IconTile icon={NotebookPen} tone="mint" />
          <div>
            <label htmlFor="note">
              ¿Alguna nota rápida? <span>(opcional)</span>
            </label>
            <textarea
              id="note"
              name="note"
              rows={2}
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Café con amigos después de la oficina"
            />
          </div>
        </div>
        <p className="privacy-note">
          <LockKeyhole size={18} />
          <span>
            Tus montos y emociones son privados.
            <br />
            Solo se usan para tu registro.
          </span>
        </p>
        <footer className="form-footer">
          <Button type="submit" className="full-width">
            Guardar decisión
            <CheckCircle2 size={19} />
          </Button>
          <span className="flow-demo-label">
            {live
              ? "Tu registro se guarda solo en este dispositivo"
              : "Registro de demostración · sin persistencia"}
          </span>
        </footer>
      </form>
    </main>
  );
}
