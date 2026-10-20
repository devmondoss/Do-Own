"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  Camera,
  Download,
  ImagePlus,
  Lightbulb,
  NotebookText,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  FlowHeader,
  IconTile,
} from "@/components/ui/primitives";
import { useDemo } from "@/providers/demo-provider";
import { getEvidence } from "@/lib/evidence-store";
import { categoryLabels, emotionEmoji, emotionLabels } from "@/lib/labels";
import { decisionDate } from "@/lib/decision-summary";
import { monthName, weekdayOf } from "@/lib/periods";
import type { DecisionCategory, DecisionRecord, Emotion } from "@/types/do-own";

const WEEKDAYS = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];
const time = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  }).format(new Date(iso));
const dayTitle = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Mexico_City",
  }).format(new Date(iso));
const money = (amount: string) =>
  `$${Number(amount).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** F03: patterns only when there is enough data, phrased as observations. */
function patterns(records: DecisionRecord[]) {
  if (records.length < 5) return [];
  const out: string[] = [];
  const byCat = new Map<DecisionCategory, number>();
  records.forEach((r) =>
    byCat.set(r.category, (byCat.get(r.category) ?? 0) + 1),
  );
  const [topCat, topCount] = [...byCat.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0];
  out.push(
    `${Math.round((topCount / records.length) * 100)}% de tus registros son "${categoryLabels[topCat]}".`,
  );
  const antojos = records.filter((r) => r.category === "antojo");
  if (antojos.length >= 3) {
    const days = new Array(7).fill(0);
    antojos.forEach((r) => (days[weekdayOf(decisionDate(r.createdAt))] += 1));
    const max = Math.max(...days);
    if (max >= 2)
      out.push(`Tus antojos aparecen más los ${WEEKDAYS[days.indexOf(max)]}.`);
  }
  const byEmo = new Map<Emotion, number>();
  records.forEach((r) => byEmo.set(r.emotion, (byEmo.get(r.emotion) ?? 0) + 1));
  const [topEmo] = [...byEmo.entries()].sort((a, b) => b[1] - a[1])[0];
  out.push(
    `La emoción que más registras es ${emotionLabels[topEmo].toLowerCase()} ${emotionEmoji[topEmo]}.`,
  );
  return out;
}

function exportCsv(records: DecisionRecord[]) {
  const head = [
    "fecha",
    "hora",
    "que_compre",
    "monto",
    "moneda",
    "categoria",
    "emocion",
    "nota",
    "evidencia",
  ];
  const esc = (v: string) => `"${v.replaceAll('"', '""')}"`;
  const rows = records.map((r) =>
    [
      decisionDate(r.createdAt),
      time(r.createdAt),
      r.item ?? "",
      r.amount,
      r.currency,
      categoryLabels[r.category],
      emotionLabels[r.emotion],
      r.note,
      r.photoAttached ? "sí" : "no",
    ]
      .map(esc)
      .join(","),
  );
  const blob = new Blob(["﻿" + [head.join(","), ...rows].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `do-own-historial-${decisionDate(new Date().toISOString())}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function HistoryScreen() {
  const { data, setEvidence, notify } = useDemo();
  const [category, setCategory] = useState<DecisionCategory | "todas">("todas");
  const [emotion, setEmotion] = useState<Emotion | "todas">("todas");
  const [viewing, setViewing] = useState<{ id: string; url: string } | null>(
    null,
  );
  const [version, setVersion] = useState(0);

  const all = useMemo(
    () =>
      [...data.decisions].sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      ),
    [data.decisions],
  );
  const records = all.filter(
    (r) =>
      (category === "todas" || r.category === category) &&
      (emotion === "todas" || r.emotion === emotion),
  );
  const insights = patterns(all);

  // Group: month → day → records
  const groups = new Map<string, Map<string, DecisionRecord[]>>();
  records.forEach((r) => {
    const day = decisionDate(r.createdAt);
    const month = day.slice(0, 7);
    if (!groups.has(month)) groups.set(month, new Map());
    const m = groups.get(month)!;
    m.set(day, [...(m.get(day) ?? []), r]);
  });

  async function onFile(event: ChangeEvent<HTMLInputElement>, id: string) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      notify("Elige una imagen JPG, PNG o WebP de hasta 10 MB.");
      return;
    }
    await setEvidence(id, file);
    setVersion((v) => v + 1);
    notify("Evidencia guardada en este teléfono.");
  }
  async function remove(recordId: string) {
    await setEvidence(recordId, null);
    setViewing(null);
    setVersion((v) => v + 1);
    notify("Evidencia eliminada.");
  }
  async function view(recordId: string) {
    const blob = await getEvidence(recordId);
    if (!blob) {
      notify("Esta foto no está guardada en este teléfono.");
      return;
    }
    setViewing({ id: recordId, url: URL.createObjectURL(blob) });
  }

  return (
    <main id="contenido" className="page history-page">
      <FlowHeader
        title="Mi historial"
        back="/inicio"
        action={<Badge tone="neutral">{all.length} registros</Badge>}
      />

      {insights.length > 0 && (
        <Card className="insights-card">
          <IconTile icon={Lightbulb} tone="amber" />
          <div>
            <h2>Lo que observamos</h2>
            <ul>
              {insights.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="field-hint">
              Son observaciones de tus propios registros, no conclusiones ni
              consejos.
            </p>
          </div>
        </Card>
      )}

      <div
        className="history-filters"
        role="group"
        aria-label="Filtrar por tipo de decisión"
      >
        {(["todas", "antojo", "habitual", "ahorro"] as const).map((c) => (
          <button
            key={c}
            className="chip"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c === "todas" ? "Todas" : categoryLabels[c]}
          </button>
        ))}
      </div>
      <div
        className="history-filters"
        role="group"
        aria-label="Filtrar por emoción"
      >
        <button
          className="chip"
          aria-pressed={emotion === "todas"}
          onClick={() => setEmotion("todas")}
        >
          Todas las emociones
        </button>
        {(Object.keys(emotionLabels) as Emotion[]).map((e) => (
          <button
            key={e}
            className="chip"
            aria-pressed={emotion === e}
            onClick={() => setEmotion(e)}
            aria-label={emotionLabels[e]}
          >
            {emotionEmoji[e]} {emotionLabels[e]}
          </button>
        ))}
      </div>

      {records.length === 0 ? (
        <Card className="empty-state">
          <IconTile icon={NotebookText} tone="mint" />
          <p>
            {all.length === 0
              ? "Aún no tienes registros. Cada decisión que anotes aparecerá aquí."
              : "No hay registros con estos filtros."}
          </p>
          {all.length === 0 && (
            <Link className="button button-primary" href="/registro">
              Registrar mi primera decisión
            </Link>
          )}
        </Card>
      ) : (
        [...groups.entries()].map(([month, days]) => (
          <section key={month} className="history-month">
            <h2 className="history-month-title">{monthName(month)}</h2>
            {[...days.entries()].map(([day, items]) => (
              <div key={day} className="history-day">
                <h3>{dayTitle(items[0].createdAt)}</h3>
                {items.map((r) => (
                  <Card key={r.id} className="history-item">
                    <div className="history-item-main">
                      <span className="history-emoji" aria-hidden="true">
                        {emotionEmoji[r.emotion]}
                      </span>
                      <div>
                        <strong>{r.item || categoryLabels[r.category]}</strong>
                        <span>
                          {categoryLabels[r.category]} ·{" "}
                          {emotionLabels[r.emotion]} · {time(r.createdAt)}
                        </span>
                        {r.note && <p>{r.note}</p>}
                      </div>
                      <strong className="history-amount">
                        {money(r.amount)}
                      </strong>
                    </div>
                    <div className="history-evidence">
                      {r.photoAttached ? (
                        <>
                          <EvidenceThumb
                            recordId={r.id}
                            version={version}
                            onOpen={() => view(r.id)}
                          />
                          <PhotoPicker onChange={(e) => onFile(e, r.id)}>
                            <RefreshCw size={14} /> Cambiar foto
                          </PhotoPicker>
                          <button
                            className="text-link danger-link"
                            onClick={() => remove(r.id)}
                          >
                            <Trash2 size={14} /> Quitar
                          </button>
                        </>
                      ) : (
                        <PhotoPicker onChange={(e) => onFile(e, r.id)}>
                          <ImagePlus size={15} /> Agregar foto de evidencia
                        </PhotoPicker>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ))}
          </section>
        ))
      )}

      {all.length > 0 && (
        <Button
          variant="secondary"
          className="full-width"
          onClick={() => exportCsv(all)}
        >
          <Download size={17} />
          Descargar mi historial (CSV)
        </Button>
      )}

      {viewing && (
        <div
          className="evidence-viewer"
          role="dialog"
          aria-label="Foto de evidencia"
        >
          <button
            className="icon-button"
            aria-label="Cerrar foto"
            onClick={() => {
              URL.revokeObjectURL(viewing.url);
              setViewing(null);
            }}
          >
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
          <img src={viewing.url} alt="Foto de evidencia del registro" />
        </div>
      )}
    </main>
  );
}

function PhotoPicker({
  onChange,
  children,
}: {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  children: ReactNode;
}) {
  return (
    <label className="text-link photo-picker">
      {children}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="visually-hidden"
        onChange={onChange}
      />
    </label>
  );
}

function EvidenceThumb({
  recordId,
  version,
  onOpen,
}: {
  recordId: string;
  version: number;
  onOpen: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let current: string | null = null;
    let cancelled = false;
    getEvidence(recordId).then((blob) => {
      if (cancelled || !blob) return;
      current = URL.createObjectURL(blob);
      setUrl(current);
    });
    return () => {
      cancelled = true;
      if (current) URL.revokeObjectURL(current);
    };
  }, [recordId, version]);
  return (
    <button
      className="evidence-thumb"
      onClick={onOpen}
      aria-label="Ver foto de evidencia"
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- local blob URL
        <img src={url} alt="" />
      ) : (
        <Camera size={18} />
      )}
    </button>
  );
}
