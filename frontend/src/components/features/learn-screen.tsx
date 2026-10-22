"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  Play,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  FlowHeader,
  IconTile,
  ProgressBar,
  SectionHeading,
} from "@/components/ui/primitives";
import { useDemo } from "@/providers/demo-provider";
import { lessons } from "@/data/mock-data";
import { categoryLabels } from "@/lib/labels";
import { validDecisions } from "@/lib/periods";
import { handleCompletarLeccion } from "@/lib/integrations";

export function LearnScreen() {
  const { data, completeLesson, notify } = useDemo();
  const dialog = useRef<HTMLDialogElement>(null);
  const [activeId, setActiveId] = useState(lessons[0].id);
  const lesson = lessons.find((l) => l.id === activeId) ?? lessons[0];
  const lessonSteps = lesson.steps;
  const lessonQuestions = lesson.questions;
  const totalSteps = lessonSteps.length + lessonQuestions.length;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null]);
  // First answer per question, to report "correct on the first try".
  const [firstTry, setFirstTry] = useState<(boolean | null)[]>([null, null]);
  const [summary, setSummary] = useState<{
    firstTryCorrect: number;
    total: number;
    repeat: boolean;
  } | null>(null);
  const questionIndex = step - lessonSteps.length;
  const question = lessonQuestions[questionIndex];
  const answer = answers[questionIndex];
  const correct = !!question && answer === question.correctIndex;
  const isDone = (id: string) =>
    !!data.lessonsCompleted?.includes(id) ||
    (id === "antojo-v1" && data.lessonCompleted);

  // F04: recommend the lesson about the kind of decision registered most.
  const counts = new Map<string, number>();
  validDecisions(data.decisions).forEach((d) =>
    counts.set(d.category, (counts.get(d.category) ?? 0) + 1),
  );
  const ranked = [...lessons].sort(
    (a, b) => (counts.get(b.category) ?? 0) - (counts.get(a.category) ?? 0),
  );
  const featured = ranked.find((l) => !isDone(l.id)) ?? ranked[0];
  const featuredCount = counts.get(featured.category) ?? 0;
  const totalRecords = validDecisions(data.decisions).length;
  const others = lessons.filter((l) => l.id !== featured.id);
  function openLesson(id = lessons[0].id) {
    setActiveId(id);
    setStep(0);
    setAnswers([null, null]);
    setFirstTry([null, null]);
    setSummary(null);
    dialog.current?.showModal();
  }
  function finishLesson() {
    handleCompletarLeccion();
    // DEMO(UI): a repeat lesson never creates another reward in memory.
    // TODO(BACKEND): validate all answers before awarding the real completion.
    const repeat = isDone(lesson.id);
    completeLesson(lesson.id);
    setSummary({
      firstTryCorrect: firstTry.filter(Boolean).length,
      total: lessonQuestions.length,
      repeat,
    });
    notify(
      repeat
        ? "Repaso completado. Sigue observando a tu ritmo."
        : "¡Microlección completada! Tienes una recompensa disponible.",
    );
  }
  return (
    <main id="contenido" className="page learn-page">
      <FlowHeader
        title="Aprende"
        action={
          <Badge tone="amber">
            <Flame size={16} />
            {data.streakDays} d
          </Badge>
        }
      />
      <section className="learning-banner">
        <div>
          <span className="banner-label">CRECIMIENTO DIARIO</span>
          <h2>Aprende a tu ritmo</h2>
          <p>
            Unos minutos para observar tus decisiones y entender cómo te
            sientes.
          </p>
        </div>
        <div className="learning-art">
          <Image
            src="/images/learning.jpg"
            width={150}
            height={150}
            alt="Un pequeño universo de ideas en tonos lavanda y menta"
          />
        </div>
      </section>
      <Card className="featured-lesson">
        <div className="lesson-meta">
          <Badge>
            <Sparkles size={14} />
            {isDone(featured.id)
              ? "Microaprendizaje completado"
              : "Aprendizaje aplicado · +25 pts"}
          </Badge>
          <Badge tone="neutral">Recomendada para ti</Badge>
        </div>
        <h2>{featured.title}</h2>
        <p>{featured.summary}</p>
        <div className="lesson-perks">
          <div>
            <IconTile icon={Clock3} />
            <span>Contenido breve (5 minutos)</span>
          </div>
          <div>
            <IconTile icon={ListChecks} tone="mint" />
            <span>Dos preguntas para llevarte una idea</span>
          </div>
          <div>
            <IconTile icon={CheckCircle2} tone="mint" />
            <span>Conecta el aprendizaje con tu registro</span>
          </div>
        </div>
        {featuredCount > 0 && (
          <p className="lesson-context">
            Te la recomendamos porque {featuredCount} de tus {totalRecords}{" "}
            registros son “{categoryLabels[featured.category]}”.
          </p>
        )}
        <Button className="full-width" onClick={() => openLesson(featured.id)}>
          {isDone(featured.id) ? "Repasar lección" : "Comenzar lección"}
          {isDone(featured.id) ? <Check size={18} /> : <Play size={17} />}
        </Button>
      </Card>
      <section className="upcoming-section">
        <SectionHeading
          aside={
            <span className="subtle-caption">
              {lessons.filter((l) => isDone(l.id)).length}/{lessons.length}{" "}
              completadas
            </span>
          }
        >
          Más lecciones
        </SectionHeading>
        <div className="upcoming-lessons">
          {others.map((l) => (
            <article key={l.id} className="upcoming-card lesson-available">
              <IconTile
                icon={l.category === "ahorro" ? Wallet : Brain}
                tone="violet"
              />
              <div>
                <Badge tone="mint">{l.badge}</Badge>
                <h3>{l.title}</h3>
                <p>{l.summary}</p>
              </div>
              <Button
                variant={isDone(l.id) ? "quiet" : "primary"}
                onClick={() => openLesson(l.id)}
                aria-label={`${isDone(l.id) ? "Repasar" : "Comenzar"}: ${l.title}`}
              >
                {isDone(l.id) ? <Check size={17} /> : <Play size={16} />}
              </Button>
            </article>
          ))}
          <UpcomingLesson
            icon={Wallet}
            category="Tu cuenta digital"
            title="Conoce tus recompensas"
            text="Aprende a consultar y mover lo que recibes"
          />
        </div>
        <p className="unlock-note">
          <LockKeyhole size={13} />
          Sigue aprendiendo: pronto habrá más para ti.
        </p>
      </section>
      <dialog
        ref={dialog}
        aria-label={lesson.dialogLabel}
        className="lesson-dialog"
      >
        <div className="lesson-dialog-header">
          <Badge>
            <BookOpen size={14} />
            TU MICROAPRENDIZAJE
          </Badge>
          <button
            className="icon-button"
            aria-label="Cerrar lección"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        {summary ? (
          <div className="lesson-summary">
            <IconTile icon={CheckCircle2} tone="mint" />
            <h2>
              {summary.repeat ? "¡Repaso completado!" : "¡Lección completada!"}
            </h2>
            <p>Lo que te llevas de “{lesson.title}”:</p>
            <ul>
              {lessonSteps.map((s) => (
                <li key={s.title}>{s.highlight}</li>
              ))}
            </ul>
            <dl className="transfer-summary">
              <div>
                <dt>Cuestionario</dt>
                <dd>
                  {summary.total} de {summary.total} correctas ·{" "}
                  {summary.firstTryCorrect} al primer intento
                </dd>
              </div>
              <div>
                <dt>Tu avance de hoy</dt>
                <dd>{data.completedActions.length} de 3 acciones</dd>
              </div>
              <div>
                <dt>Recompensa</dt>
                <dd>
                  {summary.repeat
                    ? "Ya la recibiste antes: repasar no suma otra"
                    : "1 disponible para recibir"}
                </dd>
              </div>
            </dl>
            <div className="lesson-dialog-actions">
              <Button variant="quiet" onClick={() => dialog.current?.close()}>
                Cerrar
              </Button>
              {!summary.repeat && (
                <Link className="button button-primary" href="/recompensa">
                  Ver mi recompensa
                  <ArrowRight size={17} />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <ProgressBar
              value={((step + 1) / totalSteps) * 100}
              label="Avance de la microlección"
            />
            <span className="lesson-step-count">
              PASO {step + 1} DE {totalSteps}
            </span>
            {step < lessonSteps.length ? (
              <>
                <IconTile icon={Lightbulb} />
                <h2>{lessonSteps[step].title}</h2>
                <p>{lessonSteps[step].text}</p>
                <div className="lesson-highlight">
                  <Sparkles size={20} />
                  <strong>{lessonSteps[step].highlight}</strong>
                </div>
                <div className="lesson-dialog-actions">
                  {step > 0 && (
                    <Button variant="quiet" onClick={() => setStep(step - 1)}>
                      <ArrowLeft size={17} />
                      Atrás
                    </Button>
                  )}
                  <Button onClick={() => setStep(step + 1)}>
                    Continuar
                    <ArrowRight size={17} />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <IconTile icon={Brain} tone="mint" />
                <h2>
                  Pregunta {questionIndex + 1} de {lessonQuestions.length}
                </h2>
                <p>{question.title}</p>
                <div className="quiz-options quiz-answers">
                  {question.options.map((option, index) => (
                    <button
                      key={option}
                      aria-pressed={answer === index}
                      onClick={() => {
                        setAnswers((current) =>
                          current.map((value, i) =>
                            i === questionIndex ? index : value,
                          ),
                        );
                        setFirstTry((current) =>
                          current.map((value, i) =>
                            i === questionIndex && value === null
                              ? index === question.correctIndex
                              : value,
                          ),
                        );
                      }}
                      className={answer === index ? "quiz-selected" : ""}
                    >
                      <span>
                        {String.fromCharCode(97 + index)}) {option}
                      </span>
                      {answer === index && <Check size={17} />}
                    </button>
                  ))}
                </div>
                {answer !== null && (
                  <p
                    className={correct ? "quiz-correct" : "quiz-hint"}
                    role="status"
                  >
                    {correct ? lesson.correctFeedback : lesson.wrongFeedback}
                  </p>
                )}
                <div className="lesson-dialog-actions">
                  <Button variant="quiet" onClick={() => setStep(step - 1)}>
                    <ArrowLeft size={17} />
                    Atrás
                  </Button>
                  {questionIndex === 0 ? (
                    <Button
                      disabled={!correct}
                      onClick={() => setStep(step + 1)}
                    >
                      Siguiente pregunta
                      <ArrowRight size={17} />
                    </Button>
                  ) : (
                    <Button
                      disabled={
                        !correct ||
                        answers[0] !== lessonQuestions[0].correctIndex
                      }
                      onClick={finishLesson}
                    >
                      Completar microlección
                      <CheckCircle2 size={18} />
                    </Button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </dialog>
      {data.lessonCompleted && (
        <div className="lesson-completed-note">
          <CheckCircle2 size={18} />
          <p>
            Un paso más para tu bienestar.{" "}
            <Link href="/recompensa">Ver mi recompensa →</Link>
          </p>
        </div>
      )}
    </main>
  );
}
function UpcomingLesson({
  icon,
  category,
  title,
  text,
}: {
  icon: typeof Brain;
  category: string;
  title: string;
  text: string;
}) {
  return (
    <article
      className="upcoming-card"
      aria-label={`${title}. Próximamente, lección bloqueada.`}
    >
      <IconTile icon={icon} tone="neutral" />
      <div>
        <Badge tone="mint">{category}</Badge>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <span className="lock-circle">
        <LockKeyhole size={17} />
      </span>
    </article>
  );
}
