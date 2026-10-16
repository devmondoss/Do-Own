export type DecisionCategory = "antojo" | "habitual" | "ahorro";
export type Emotion = "tranquilo" | "estres" | "rutina";
export type DailyAction = "decision" | "emotion" | "lesson";

// TODO(BACKEND): agree on API DTOs with the backend team before connecting.
// Keep amounts as decimal strings at the integration boundary (no float money).
export interface DecisionInput {
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
  reason: "registro" | "aprendizaje";
  units: number;
  status: "available" | "claimed";
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
  profile: { name: string; level: number };
  balanceUnits: number;
  streakDays: number;
  completedActions: DailyAction[];
  lessonCompleted: boolean;
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
