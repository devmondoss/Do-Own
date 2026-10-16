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

// Source: docs/semana3/contenido-microleccion-antojo, authored by the team.
export const lessonSteps = [
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
];
export const lessonQuestions = [
  {
    title: "¿Qué significa registrar una compra como Antojo?",
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
      "Para ganar menos puntos que con Guardé",
    ],
    correctIndex: 1,
  },
];
