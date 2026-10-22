"use client";

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
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
import { photoFingerprint } from "@/lib/duplicates";
import {
  deleteEvidence,
  getEvidence,
  saveEvidence,
} from "@/lib/evidence-store";

// If the phone reloads the page while the camera is open (common on Android),
// the form comes back with what the person already wrote and the photo.
const DRAFT_KEY = "do-own.draft.v1";
const DRAFT_PHOTO = "draft";
import { handleAnalizarFoto, handleGuardarDecision } from "@/lib/integrations";
import type { Currency, DecisionCategory, Emotion } from "@/types/do-own";
import { currencyNames, emotionOptions } from "@/lib/labels";

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
const emotions = emotionOptions;

export function RegisterScreen() {
  const router = useRouter();
  const { saveDecision, notify, live } = useDemo();
  const [item, setItem] = useState("");
  const [itemError, setItemError] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("MXN");
  const [category, setCategory] = useState<DecisionCategory>("antojo");
  const [emotion, setEmotion] = useState<Emotion>("tranquilo");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        /* eslint-disable react-hooks/set-state-in-effect -- restores an unsent draft once */
        if (typeof d.item === "string") setItem(d.item);
        if (typeof d.amount === "string") setAmount(d.amount);
        if (d.currency === "MXN" || d.currency === "USD")
          setCurrency(d.currency);
        if (typeof d.category === "string") setCategory(d.category);
        if (typeof d.emotion === "string") setEmotion(d.emotion);
        if (typeof d.note === "string") setNote(d.note);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      /* ignore */
    }
    void getEvidence(DRAFT_PHOTO).then((blob) => {
      if (!blob) return;
      const file = new File([blob], "evidencia.jpg", {
        type: blob.type || "image/jpeg",
      });
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    });
    setDraftLoaded(true);
  }, []);
  useEffect(() => {
    if (!draftLoaded) return;
    try {
      window.localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ item, amount, currency, category, emotion, note }),
      );
    } catch {
      /* ignore */
    }
  }, [draftLoaded, item, amount, currency, category, emotion, note]);
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
    void saveEvidence(DRAFT_PHOTO, file);
    handleAnalizarFoto(file);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const itemMissing = !item.trim();
    const photoMissing = !photo;
    const normalized = amount.trim().replace(",", ".");
    const amountBad =
      !/^\d+(\.\d{1,2})?$/.test(normalized) ||
      Number(normalized) <= 0 ||
      Number(normalized) > 999999999;
    setItemError(
      itemMissing ? "Escribe qué compraste o en qué fue tu decisión." : "",
    );
    setError(
      amountBad
        ? "Escribe cuánto gastaste: un monto mayor a 0, con hasta 2 decimales."
        : "",
    );
    setPhotoError(
      photoMissing
        ? "Agrega una foto de tu compra o ticket: es la evidencia de tu registro."
        : "",
    );
    if (photoMissing || itemMissing || amountBad) {
      if (photoMissing)
        document
          .querySelector(".photo-capture")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      else document.getElementById(itemMissing ? "item" : "amount")?.focus();
      return;
    }
    const input = {
      item: item.trim(),
      amount: normalized,
      currency,
      category,
      emotion,
      note: note.trim(),
      ...(photo ? { attachment: photo } : {}),
    };
    handleGuardarDecision(input);
    // F01: fingerprint of the photo so the same ticket cannot be rewarded twice.
    const photoHash = photo ? await photoFingerprint(photo) : undefined;
    // DEMO(UI): mark steps in memory, never claim these were saved on a server.
    // TODO(BACKEND): await success, handle errors/loading and only then navigate.
    const result = saveDecision({ ...input, photoHash });
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    void deleteEvidence(DRAFT_PHOTO);
    if (!result.rewarded) {
      notify(
        `Registro guardado en tu historial, sin recompensa: ${result.reason}`,
      );
      router.push("/historial");
      return;
    }
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
                <p>
                  Toma una foto de tu compra o ticket y anota cuánto gastaste.
                </p>
              </div>
            </div>
            <label className="photo-picker">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                id="photo-input"
                aria-label="Agregar foto de tu decisión"
                aria-required="true"
                aria-invalid={!!photoError}
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
                    void deleteEvidence(DRAFT_PHOTO);
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
                ? "✓ Evidencia adjuntada correctamente. Se guarda solo en este teléfono."
                : "Obligatoria: foto de tu compra o ticket (JPG, PNG o WebP, hasta 10 MB). Se guarda solo en este teléfono."}
            </p>
            <p className="field-hint privacy-hint">
              Si tu ticket muestra tu nombre, dirección o números de tarjeta,
              tápalos antes de tomar la foto.
            </p>
          </section>
          <section className="item-card">
            <label htmlFor="item" className="eyebrow">
              ¿QUÉ COMPRASTE?
            </label>
            <input
              id="item"
              name="item"
              autoComplete="off"
              maxLength={80}
              value={item}
              onChange={(e) => {
                setItem(e.target.value);
                if (itemError) setItemError("");
              }}
              placeholder="Café, despensa, pasaje…"
              aria-invalid={!!itemError}
              aria-describedby={itemError ? "item-error" : undefined}
            />
            {itemError && (
              <p className="field-error" id="item-error" role="alert">
                {itemError}
              </p>
            )}
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
                aria-label={`Monto en ${currencyNames[currency]}`}
                placeholder="0.00"
              />
              <span className="currency-label">{currency}</span>
            </div>
            <div
              className="currency-switch"
              role="radiogroup"
              aria-label="Moneda"
              id="amount-hint"
            >
              {(["MXN", "USD"] as const).map((c) => (
                <label key={c} className={currency === c ? "is-selected" : ""}>
                  <input
                    type="radio"
                    name="currency"
                    value={c}
                    checked={currency === c}
                    onChange={() => setCurrency(c)}
                  />
                  {c} · {c === "MXN" ? "Pesos" : "Dólares"}
                </label>
              ))}
            </div>
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
          <legend>¿Cómo te sientes con este gasto?</legend>
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
