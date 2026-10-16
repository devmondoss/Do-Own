"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Camera,
  Heart,
  ReceiptText,
} from "lucide-react";
import {
  Badge,
  ButtonLink,
  Card,
  FlowHeader,
  IconTile,
  SectionHeading,
} from "@/components/ui/primitives";
import { useDemo } from "@/providers/demo-provider";
import { decisionDate, recentDecisions } from "@/lib/decision-summary";

const categories = [
  { id: "antojo", label: "Antojo", tone: "violet" as const },
  { id: "habitual", label: "Lo de siempre", tone: "amber" as const },
  { id: "ahorro", label: "Guardé", tone: "mint" as const },
];
const emotionLabels = {
  tranquilo: "Tranquilo",
  estres: "Estrés",
  rutina: "Rutina",
};
const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeZone: "America/Mexico_City",
  }).format(new Date(value));

export function ReflectionScreen() {
  const { data } = useDemo();
  const records = recentDecisions(data.decisions);
  const days = new Set(records.map((record) => decisionDate(record.createdAt)))
    .size;
  return (
    <main id="contenido" className="page reflection-page">
      <FlowHeader
        title="Mi reflexión semanal"
        back="/progreso"
        action={<Badge tone="neutral">Demo</Badge>}
      />
      <section className="reflection-intro">
        <span className="eyebrow">OBSERVAR TAMBIÉN ES AVANZAR</span>
        <h2>Una semana para mirar con calma.</h2>
        <p>
          Estos son tus registros, tal como los anotaste. No hay decisiones
          buenas o malas: aquí puedes observarlas.
        </p>
        <span className="field-hint">
          Últimos 7 días a partir de tu registro más reciente. Incluye datos de
          ejemplo y los registros de esta sesión.
        </span>
      </section>
      <div className="reflection-grid">
        <Card className="reflection-summary">
          <IconTile icon={CalendarDays} />
          <div>
            <strong>{records.length}</strong>
            <span>decisiones registradas</span>
          </div>
          <div>
            <strong>{days}</strong>
            <span>días con registros</span>
          </div>
        </Card>
        <Card className="reflection-categories">
          <SectionHeading>Lo que registraste</SectionHeading>
          <div className="category-totals">
            {categories.map((category) => {
              const grouped = records.filter(
                (record) => record.category === category.id,
              );
              const cents = grouped.reduce(
                (sum, record) => sum + Math.round(Number(record.amount) * 100),
                0,
              );
              return (
                <div key={category.id}>
                  <Badge tone={category.tone}>{category.label}</Badge>
                  <strong>
                    {new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    }).format(cents / 100)}{" "}
                    <small>MXN</small>
                  </strong>
                  <span>
                    {grouped.length}{" "}
                    {grouped.length === 1 ? "registro" : "registros"}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="field-hint">
            Cada categoría muestra su propio monto. El ahorro se presenta por
            separado de los gastos.
          </p>
        </Card>
        <Card className="reflection-emotions">
          <SectionHeading>Cómo te sentiste</SectionHeading>
          {Object.entries(emotionLabels).map(([emotion, label]) => {
            const count = records.filter(
              (record) => record.emotion === emotion,
            ).length;
            return (
              <div className="emotion-count" key={emotion}>
                <span>{label}</span>
                <div>
                  <span
                    style={{
                      width: `${records.length ? (count / records.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <strong>{count}</strong>
              </div>
            );
          })}
          <p className="field-hint">
            Son las emociones que seleccionaste. La app no interpreta ni
            diagnostica estos datos.
          </p>
        </Card>
        <section className="reflection-records">
          <SectionHeading
            aside={
              <Link className="text-link" href="/registro">
                Agregar registro →
              </Link>
            }
          >
            Tus decisiones
          </SectionHeading>
          <div className="record-list">
            {records.map((record) => (
              <article className="card record-card" key={record.id}>
                <div className="record-heading">
                  <Badge
                    tone={
                      categories.find(
                        (category) => category.id === record.category,
                      )?.tone
                    }
                  >
                    {
                      categories.find(
                        (category) => category.id === record.category,
                      )?.label
                    }
                  </Badge>
                  <time dateTime={record.createdAt}>
                    {dateLabel(record.createdAt)}
                  </time>
                </div>
                <h3>
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  }).format(Number(record.amount))}{" "}
                  MXN
                </h3>
                <p>{record.note || "Sin nota adicional"}</p>
                <footer>
                  <span>
                    <Heart size={13} />
                    {emotionLabels[record.emotion]}
                  </span>
                  {record.photoAttached && (
                    <span>
                      <Camera size={13} />
                      Foto adjunta en esta sesión
                    </span>
                  )}
                </footer>
              </article>
            ))}
          </div>
        </section>
        <Card className="reflection-next">
          <IconTile icon={BookOpen} tone="mint" />
          <div>
            <h3>Observa, aprende y vuelve a observar</h3>
            <p>
              Puedes relacionar tu registro con una microlección o consultar tu
              comprobante de constancia.
            </p>
          </div>
          <div>
            <ButtonLink href="/aprender" variant="secondary">
              Seguir aprendiendo
            </ButtonLink>
            <ButtonLink href="/comprobante" variant="quiet">
              <ReceiptText size={17} />
              Ver comprobante
            </ButtonLink>
          </div>
        </Card>
      </div>
      <p className="flow-demo-label">
        Datos en memoria · tus nuevos registros se reinician al recargar.
      </p>
    </main>
  );
}
