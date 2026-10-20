export type DecisionCategory = "antojo" | "habitual" | "ahorro";
export type Emotion = "alegria" | "tranquilo" | "estres" | "triste" | "rutina";
export type DailyAction = "decision" | "emotion" | "lesson";

// TODO(BACKEND): agree on API DTOs with the backend team before connecting.
// Keep amounts as decimal strings at the integration boundary (no float money).
export interface DecisionInput {
  /** Qué compró (Product Definition F01). Optional only for older records. */
  item?: string;
  amount: string;
  currency: "MXN";
  category: DecisionCategory;
  emotion: Emotion;
  note: string;
  attachment?: File;
}

export interface DecisionRecord extends Omit<DecisionInput, "attachment"> {
  id: string;
  createdAt: string;
  photoAttached: boolean;
}

export interface DemoReward {
  id: string;
  reason: "registro" | "aprendizaje" | "semanal" | "mensual";
  units: number;
  status: "available" | "claimed";
  createdAt?: string;
  claimedAt?: string;
  /** Human description, e.g. "Semana del 13 oct al 19 oct". */
  label?: string;
}

export interface TransferInput {
  idempotencyKey: string;
  recipient: string;
  amount: string;
}

export interface DemoTransfer extends TransferInput {
  createdAt: string;
}

export interface DemoSnapshot {
  profile: { name: string; level: number; email?: string };
  balanceUnits: number;
  streakDays: number;
  completedActions: DailyAction[];
  lessonCompleted: boolean;
  /** Lesson ids completed at least once (e.g. "antojo-v1"). */
  lessonsCompleted?: string[];
  onboardingComplete: boolean;
  decisions: DecisionRecord[];
  rewards: DemoReward[];
  transfers: DemoTransfer[];
}

export interface HabitProof {
  title: string;
  habit: string;
  completedDays: number;
  totalDays: number;
  memoHashDisplay: string;
  memoHashFull: string;
  network: "testnet" | "public";
  timestamp: string;
  // TODO(STELLAR): set only from a confirmed transaction returned by the server.
  transactionHash: string | null;
}

// Future server response: distinguish pending, failed and confirmed on-chain states.
export interface RewardReceipt {
  status: "pending" | "confirmed" | "failed";
  amount: string;
  asset: { code: string; issuer: string };
  transactionHash: string | null;
}
