import type { DecisionCategory, Emotion } from "@/types/do-own";

export const categoryLabels: Record<DecisionCategory, string> = {
  antojo: "Antojo",
  habitual: "Lo de siempre",
  ahorro: "Guardé",
};

// Product Definition F07: emotions the person can choose (no diagnosis, no judgment).
export const emotionOptions: {
  value: Emotion;
  title: string;
  subtitle: string;
  emoji: string;
}[] = [
  { value: "alegria", title: "Alegría", subtitle: "Contento", emoji: "😄" },
  {
    value: "tranquilo",
    title: "Tranquilo",
    subtitle: "Satisfecho",
    emoji: "😊",
  },
  { value: "estres", title: "Estrés", subtitle: "O culpa", emoji: "🙁" },
  { value: "triste", title: "Tristeza", subtitle: "Desánimo", emoji: "😢" },
  { value: "rutina", title: "Rutina", subtitle: "Neutro", emoji: "😌" },
];

export const emotionLabels = Object.fromEntries(
  emotionOptions.map((e) => [e.value, e.title]),
) as Record<Emotion, string>;
export const emotionEmoji = Object.fromEntries(
  emotionOptions.map((e) => [e.value, e.emoji]),
) as Record<Emotion, string>;
