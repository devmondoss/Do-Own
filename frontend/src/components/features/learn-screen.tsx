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
import { lessonQuestions, lessonSteps } from "@/data/mock-data";
import { handleCompletarLeccion } from "@/lib/integrations";

export function LearnScreen() {
  const { data, completeLesson, notify } = useDemo();
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null]);
  const questionIndex = step - lessonSteps.length;
  const question = lessonQuestions[questionIndex];
  const answer = answers[questionIndex];
  const correct = !!question && answer === question.correctIndex;
  function openLesson() {
    setStep(0);
    setAnswers([null, null]);
    dialog.current?.showModal();
  }
  function finishLesson() {
    handleCompletarLeccion();
    // DEMO(UI): a repeat lesson never creates another reward in memory.
    // TODO(BACKEND): validate all answers before awarding the real completion.
    completeLesson();
    dialog.current?.close();
    notify(
      data.lessonCompleted
        ? "Repaso completado. Sigue observando a tu ritmo."
        : "¡Microlección completada! Tienes una recompensa adicional en la demo.",
    );
  }
  return (
    <main id="contenido" className="page learn-page">
      <FlowHeader
        title="Aprender"
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
            {data.lessonCompleted
              ? "Microaprendizaje completado"
              : "Aprendizaje aplicado · +25 pts"}
          </Badge>
          <Badge tone="neutral">Nivel 1</Badge>
        </div>
        <h2>¿Qué es un Antojo?</h2>
        <p>
          Una decisión del momento, sin juicios. Descubre para qué sirve
          observarla y registrarla con honestidad.
        </p>
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
        {data.decisions.some(
          (record) =>
            record.category === "antojo" && !record.id.startsWith("sample-"),
        ) && (
          <p className="lesson-context">
            Elegiste Antojo en uno de tus registros de esta sesión. Esta lección
            se relaciona con esa decisión.
          </p>
        )}
        <Button className="full-width" onClick={openLesson}>
          {data.lessonCompleted ? "Repasar lección" : "Comenzar lección"}
          {data.lessonCompleted ? <Check size={18} /> : <Play size={17} />}
        </Button>
      </Card>
      <section className="upcoming-section">
        <SectionHeading
          aside={<span className="subtle-caption">Próximamente</span>}
        >
          Próximas lecciones
        </SectionHeading>
        <div className="upcoming-lessons">
          <UpcomingLesson
            icon={Brain}
            category="Tus decisiones"
            title="Reconocer momentos y emociones"
            text="Observa cuándo aparecen tus decisiones habituales"
          />
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
        aria-label="Microlección de Antojos"
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
        <ProgressBar
          value={((step + 1) / 4) * 100}
          label="Avance de la microlección"
        />
        <span className="lesson-step-count">PASO {step + 1} DE 4</span>
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
            <h2>Pregunta {questionIndex + 1} de 2</h2>
            <p>{question.title}</p>
            <div className="quiz-options quiz-answers">
              {question.options.map((option, index) => (
                <button
                  key={option}
                  aria-pressed={answer === index}
                  onClick={() =>
                    setAnswers((current) =>
                      current.map((value, i) =>
                        i === questionIndex ? index : value,
                      ),
                    )
                  }
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
                {correct
                  ? "Así es. Observar sin juzgar te ayuda a reconocer tus propios patrones."
                  : "Vuelve a intentarlo: registrar una decisión no es juzgarla, es empezar a verla."}
              </p>
            )}
            <div className="lesson-dialog-actions">
              <Button variant="quiet" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={17} />
                Atrás
              </Button>
              {questionIndex === 0 ? (
                <Button disabled={!correct} onClick={() => setStep(step + 1)}>
                  Siguiente pregunta
                  <ArrowRight size={17} />
                </Button>
              ) : (
                <Button
                  disabled={
                    !correct || answers[0] !== lessonQuestions[0].correctIndex
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
