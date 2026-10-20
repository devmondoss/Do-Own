import type { DemoSnapshot, HabitProof } from "@/types/do-own";

// TODO(BACKEND): replace this seed with authenticated server data.
// Demo data lives only in React memory and resets on a full refresh.
export const initialDemo: DemoSnapshot = {
  profile: { name: "Ana", level: 4 },
  balanceUnits: 125,
  streakDays: 14,
  completedActions: [],
  lessonCompleted: false,
  onboardingComplete: false,
  rewards: [],
  transfers: [],
  decisions: [
    {
      id: "sample-1",
      amount: "85.00",
      currency: "MXN",
      category: "antojo",
      emotion: "tranquilo",
      item: "Café",
      note: "Café con amigos",
      createdAt: "2026-10-12T18:00:00Z",
      photoAttached: false,
    },
    {
      id: "sample-2",
      amount: "420.00",
      currency: "MXN",
      category: "habitual",
      emotion: "rutina",
      item: "Despensa",
      note: "Compra de la semana",
      createdAt: "2026-10-13T16:30:00Z",
      photoAttached: false,
    },
    {
      id: "sample-3",
      amount: "150.00",
      currency: "MXN",
      category: "ahorro",
      emotion: "tranquilo",
      item: "Ahorro semanal",
      note: "Aparté un poco",
      createdAt: "2026-10-14T15:00:00Z",
      photoAttached: false,
    },
    {
      id: "sample-4",
      amount: "60.00",
      currency: "MXN",
      category: "antojo",
      emotion: "estres",
      item: "Snack",
      note: "Un snack por la tarde",
      createdAt: "2026-10-14T23:00:00Z",
      photoAttached: false,
    },
    {
      id: "sample-5",
      amount: "35.00",
      currency: "MXN",
      category: "habitual",
      emotion: "rutina",
      item: "Pasaje",
      note: "Transporte",
      createdAt: "2026-10-15T14:00:00Z",
      photoAttached: false,
    },
  ],
};

export const demoProof: HabitProof = {
  title: "Cierre Semanal #4",
  habit: "Ahorro Diario Consciente",
  completedDays: 7,
  totalDays: 7,
  memoHashDisplay: "0x8fa3...b41c",
  memoHashFull: "0x8fa3f8471e98bb41c",
  network: "testnet",
  timestamp: "2026-10-15T15:30:00Z",
  transactionHash: null,
};

// Lessons. "antojo-v1" comes from docs/semana3/contenido-microleccion-antojo
// (written by the team). "habitual-v1" and "ahorro-v1" are drafts in the same
// style, pending review by the Methodology & Product Lead.
export interface Lesson {
  id: string;
  rewardId: string;
  dialogLabel: string;
  category: "antojo" | "habitual" | "ahorro";
  badge: string;
  title: string;
  summary: string;
  steps: { title: string; text: string; highlight: string }[];
  questions: { title: string; options: string[]; correctIndex: number }[];
  correctFeedback: string;
  wrongFeedback: string;
}

export const lessons: Lesson[] = [
  {
    id: "antojo-v1",
    rewardId: "lesson-antojo-v1",
    dialogLabel: "Microlección de Antojos",
    category: "antojo",
    badge: "Tus decisiones",
    title: "¿Qué es un Antojo?",
    summary:
      "Una decisión del momento, sin juicios. Descubre para qué sirve observarla y registrarla con honestidad.",
    steps: [
      {
        title: "¿Qué es un Antojo?",
        text: "Un gasto por impulso, no por plan. No es bueno ni malo — es solo una decisión del momento.",
        highlight: "Una decisión del momento, sin juicios.",
      },
      {
        title: "Regístralo tal como fue",
        text: "Con el tiempo, eso te deja ver tu propio patrón: ¿aparece más ciertos días? ¿con ciertas personas?",
        highlight:
          "No se trata de dejar de tener antojos. Se trata de empezar a verlos.",
      },
    ],
    questions: [
      {
        title: "¿Qué significa registrar una compra como “Antojo”?",
        options: [
          "Que hiciste algo incorrecto con tu dinero",
          "Que fue una decisión guiada por un impulso del momento, ni buena ni mala",
          "Que debes evitarlo la próxima vez",
        ],
        correctIndex: 1,
      },
      {
        title: "¿Para qué sirve registrar un Antojo con honestidad?",
        options: [
          "Para que la app te lo recuerde y te sientas mal",
          "Para ver con el tiempo si hay un patrón detrás, sin juzgarlo todavía",
          "Para ganar menos puntos que con “Guardé”",
        ],
        correctIndex: 1,
      },
    ],
    correctFeedback:
      "Así es. Observar sin juzgar te ayuda a reconocer tus propios patrones.",
    wrongFeedback:
      "Vuelve a intentarlo: registrar una decisión no es juzgarla, es empezar a verla.",
  },
  {
    id: "habitual-v1",
    rewardId: "lesson-habitual-v1",
    dialogLabel: "Microlección de Lo de siempre",
    category: "habitual",
    badge: "Tus hábitos",
    title: "Lo de siempre también cuenta",
    summary:
      "Los gastos que se repiten casi sin pensarlo dicen mucho de tu semana. Aprende a mirarlos con calma.",
    steps: [
      {
        title: "¿Qué es Lo de siempre?",
        text: "Son los gastos que se repiten: el pasaje, la despensa, el café de cada mañana. Como son frecuentes, a veces dejamos de verlos.",
        highlight: "Lo frecuente se vuelve invisible si no lo observas.",
      },
      {
        title: "Pequeño, pero constante",
        text: "Un gasto pequeño que se repite cada día puede sumar más en el mes que una compra grande. Registrarlo te ayuda a ver ese total real.",
        highlight:
          "Observar lo de siempre te muestra el tamaño real de tu rutina.",
      },
    ],
    questions: [
      {
        title: "¿Por qué conviene registrar los gastos de Lo de siempre?",
        options: [
          "Porque son gastos malos que hay que eliminar",
          "Porque al repetirse pueden sumar mucho sin que lo notes",
          "Porque así la app te da más recompensas que con un Antojo",
        ],
        correctIndex: 1,
      },
      {
        title:
          "Si tu café diario cuesta $40, ¿cuánto suma en un mes de 30 días?",
        options: ["$400", "$1,200", "$40"],
        correctIndex: 1,
      },
    ],
    correctFeedback:
      "¡Exacto! Ver el total de lo frecuente te ayuda a decidir con calma, sin culpa.",
    wrongFeedback:
      "Casi. Piensa en cómo se acumula un gasto pequeño cuando se repite.",
  },
  {
    id: "ahorro-v1",
    rewardId: "lesson-ahorro-v1",
    dialogLabel: "Microlección de Guardé",
    category: "ahorro",
    badge: "Tu ahorro",
    title: "Guardar también es decidir",
    summary:
      "Apartar dinero, aunque sea poco, es una decisión que vale la pena notar y celebrar.",
    steps: [
      {
        title: "¿Qué cuenta como Guardé?",
        text: "Cada vez que decides no gastar y apartar ese dinero, aunque sean $20, es una decisión financiera tan importante como una compra.",
        highlight:
          "Ahorrar no es solo una meta grande: es una decisión diaria.",
      },
      {
        title: "Primero para ti",
        text: "Una práctica sencilla es apartar una cantidad pequeña al recibir tu dinero, antes de empezar a gastar. Así el ahorro no depende de lo que sobre.",
        highlight: "Si esperas a que sobre, casi nunca sobra.",
      },
    ],
    questions: [
      {
        title: "¿Cuál de estas acciones es un Guardé?",
        options: [
          "Comprar algo en oferta",
          "Decidir apartar $50 en lugar de gastarlos",
          "Pagar la despensa de la semana",
        ],
        correctIndex: 1,
      },
      {
        title: "¿Qué significa ahorrar “primero para ti”?",
        options: [
          "Apartar una parte al recibir tu dinero, antes de gastar",
          "Ahorrar solo lo que sobra al final del mes",
          "Gastar primero en lo que más te guste",
        ],
        correctIndex: 0,
      },
    ],
    correctFeedback:
      "¡Muy bien! Cada vez que guardas, estás construyendo un hábito, no solo un saldo.",
    wrongFeedback:
      "Revisa de nuevo: guardar es decidir apartar dinero antes de gastarlo.",
  },
];

// Kept for compatibility with existing imports.
export const lessonSteps = lessons[0].steps;
export const lessonQuestions = lessons[0].questions;
