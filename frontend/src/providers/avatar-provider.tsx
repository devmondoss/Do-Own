"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { Check, ImagePlus, RotateCcw, X } from "lucide-react";
import {
  DEFAULT_AVATAR,
  avatarDataUri,
  avatarPresets,
  type AvatarCategory,
} from "@/data/avatars";

// The chosen picture lives only on this device (localStorage). A custom photo
// is cropped and reduced to 256×256 before saving; it is never uploaded.
const KEY = "do-own.avatar.v1";
type Choice =
  | { kind: "default" }
  | { kind: "preset"; id: string }
  | { kind: "custom"; dataUrl: string };

interface AvatarContextValue {
  src: string;
  openPicker: () => void;
}
const AvatarContext = createContext<AvatarContextValue | null>(null);

function srcOf(choice: Choice) {
  if (choice.kind === "custom") return choice.dataUrl;
  if (choice.kind === "preset") {
    const preset = avatarPresets.find((p) => p.id === choice.id);
    if (preset) return avatarDataUri(preset.svg);
  }
  return DEFAULT_AVATAR;
}

async function toSquareDataUrl(file: File, size = 256) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("No se pudo leer la imagen."));
      image.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo procesar la imagen.");
    ctx.drawImage(
      img,
      (img.naturalWidth - side) / 2,
      (img.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      size,
      size,
    );
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const categories: AvatarCategory[] = [
  "Flores",
  "Tiernos",
  "Intrépidos",
  "Paisajes",
];

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<Choice>({ kind: "default" });
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restores a browser-only preference once
      if (raw) setChoice(JSON.parse(raw) as Choice);
    } catch {
      /* ignore */
    }
  }, []);

  const save = useCallback((next: Choice) => {
    setChoice(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* private mode: keep it for this session only */
    }
  }, []);

  const openPicker = useCallback(() => {
    setError("");
    dialog.current?.showModal();
  }, []);

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif|heic|heif)$/.test(file.type)) {
      setError("Elige una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("La imagen pesa más de 15 MB. Prueba con otra.");
      return;
    }
    try {
      save({ kind: "custom", dataUrl: await toSquareDataUrl(file) });
      dialog.current?.close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo usar la imagen.");
    }
  }

  const selectedId =
    choice.kind === "preset"
      ? choice.id
      : choice.kind === "custom"
        ? "custom"
        : "default";
  const src = srcOf(choice);

  return (
    <AvatarContext.Provider value={{ src, openPicker }}>
      {children}
      <dialog
        ref={dialog}
        className="lesson-dialog avatar-dialog"
        aria-label="Elegir foto de perfil"
      >
        <div className="lesson-dialog-header">
          <h2>Tu foto de perfil</h2>
          <button
            className="icon-button"
            aria-label="Cerrar"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <div className="avatar-upload-row">
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL / local preview */}
          <img src={src} alt="Foto actual" className="avatar-current" />
          <div>
            <button
              className="button button-primary"
              onClick={() => fileInput.current?.click()}
            >
              <ImagePlus size={18} />
              Subir mi foto
            </button>
            <p className="field-hint">Se queda solo en este dispositivo.</p>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            hidden
            onChange={onFile}
            aria-label="Subir una foto propia"
          />
        </div>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        {categories.map((category) => (
          <section key={category} className="avatar-section">
            <h3>{category}</h3>
            <div className="avatar-grid">
              {avatarPresets
                .filter((p) => p.category === category)
                .map((preset) => (
                  <button
                    key={preset.id}
                    className="avatar-option"
                    aria-label={preset.label}
                    aria-pressed={selectedId === preset.id}
                    onClick={() => {
                      save({ kind: "preset", id: preset.id });
                      dialog.current?.close();
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG data URL */}
                    <img src={avatarDataUri(preset.svg)} alt="" />
                    {selectedId === preset.id && (
                      <span className="avatar-check">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                ))}
            </div>
          </section>
        ))}
        {selectedId !== "default" && (
          <button
            className="text-link avatar-reset"
            onClick={() => {
              save({ kind: "default" });
              dialog.current?.close();
            }}
          >
            <RotateCcw size={15} />
            Volver a la foto original
          </button>
        )}
      </dialog>
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const context = useContext(AvatarContext);
  if (!context) throw new Error("useAvatar must be used inside AvatarProvider");
  return context;
}
