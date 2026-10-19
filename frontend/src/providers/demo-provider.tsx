"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, X } from "lucide-react";
import { initialDemo } from "@/data/mock-data";
import { decisionDate } from "@/lib/decision-summary";
import type {
  DecisionRecord,
  DecisionInput,
  DemoSnapshot,
  TransferInput,
} from "@/types/do-own";

interface DemoContextValue {
  data: DemoSnapshot;
  /** true when the server has the Stellar wallet configured: real, persisted data. */
  live: boolean;
  startDemo: (name: string) => void;
  saveDecision: (input: DecisionInput) => void;
  completeLesson: () => void;
  claimDemoReward: (id: string) => void;
  transferDemo: (input: TransferInput) => void;
  notify: (message: string) => void;
}
const DemoContext = createContext<DemoContextValue | null>(null);

const STATE_KEY = "do-own.state.v1";

const freshState: DemoSnapshot = {
  profile: { name: "", level: 1 },
  balanceUnits: 0,
  streakDays: 0,
  completedActions: [],
  lessonCompleted: false,
  onboardingComplete: false,
  decisions: [],
  rewards: [],
  transfers: [],
};

interface StoredState {
  snapshot: DemoSnapshot;
  actionsDate: string;
}

export function DemoProvider({
  children,
  live = false,
}: {
  children: ReactNode;
  live?: boolean;
}) {
  // Demo mode (no Stellar config): sample data in memory, resets on reload.
  // Live mode: starts empty and is kept on this device only (localStorage);
  // nothing here is sent to a server or to the blockchain.
  // TODO(BACKEND): sync with an authenticated server when there is a database.
  const [state, setData] = useState<DemoSnapshot>(
    live ? freshState : initialDemo,
  );
  const [hydrated, setHydrated] = useState(!live);

  useEffect(() => {
    if (!live) return;
    try {
      const raw = window.localStorage.getItem(STATE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as StoredState;
        const sameDay = stored.actionsDate === todayKey();
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restores this device's saved progress once
        setData({
          ...freshState,
          ...stored.snapshot,
          completedActions: sameDay ? stored.snapshot.completedActions : [],
        });
      }
    } catch {
      /* ignore corrupted or blocked storage */
    }
    setHydrated(true);
  }, [live]);

  useEffect(() => {
    // Only save after this device's data was restored, so an empty first
    // render never overwrites what the person already had.
    if (!live || !hydrated) return;
    try {
      const stored: StoredState = { snapshot: state, actionsDate: todayKey() };
      window.localStorage.setItem(STATE_KEY, JSON.stringify(stored));
    } catch {
      /* private mode: keep it for this session */
    }
  }, [hydrated, live, state]);

  const data: DemoSnapshot = live
    ? {
        ...state,
        streakDays: computeStreak(state.decisions),
        profile: { ...state.profile, level: computeLevel(state) },
      }
    : state;
  const [message, setMessage] = useState("");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((text: string) => {
    if (timeout.current) clearTimeout(timeout.current);
    setMessage(text);
    timeout.current = setTimeout(() => setMessage(""), 4500);
  }, []);
  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );

  const startDemo = useCallback(
    (name: string) => {
      setData((current) => ({
        ...current,
        profile: {
          ...current.profile,
          name: name.trim() || (live ? current.profile.name : "Ana"),
        },
        onboardingComplete: true,
      }));
    },
    [live],
  );

  const saveDecision = useCallback((input: DecisionInput) => {
    const id = crypto.randomUUID();
    const { attachment, ...privateFields } = input;
    // DEMO(UI): one reward per decision; this does not indicate API success.
    setData((current) => ({
      ...current,
      completedActions: Array.from(
        new Set([
          ...current.completedActions,
          "decision" as const,
          "emotion" as const,
        ]),
      ),
      decisions: [
        {
          ...privateFields,
          id,
          createdAt: new Date().toISOString(),
          photoAttached: !!attachment,
        },
        ...current.decisions,
      ],
      rewards: [
        ...current.rewards,
        {
          id: `record-${id}`,
          reason: "registro",
          units: 1,
          status: "available",
        },
      ],
    }));
  }, []);

  const completeLesson = useCallback(() => {
    // TODO(BACKEND): validate answers and award a lesson only once on the server.
    setData((current) =>
      current.lessonCompleted
        ? current
        : {
            ...current,
            lessonCompleted: true,
            completedActions: Array.from(
              new Set([...current.completedActions, "lesson" as const]),
            ),
            rewards: [
              ...current.rewards,
              {
                id: "lesson-antojo-v1",
                reason: "aprendizaje",
                units: 1,
                status: "available",
              },
            ],
          },
    );
  }, []);

  const claimDemoReward = useCallback((id: string) => {
    // TODO(STELLAR): update only after a confirmed, idempotent backend receipt.
    setData((current) => {
      const grant = current.rewards.find(
        (reward) => reward.id === id && reward.status === "available",
      );
      if (!grant) return current;
      return {
        ...current,
        balanceUnits: current.balanceUnits + grant.units,
        rewards: current.rewards.map((reward) =>
          reward.id === id ? { ...reward, status: "claimed" as const } : reward,
        ),
      };
    });
  }, []);

  const transferDemo = useCallback((input: TransferInput) => {
    // DEMO(UI): local debit only; a repeated key never debits twice.
    // TODO(STELLAR): server validates destination, balance and idempotency.
    setData((current) => {
      const amount = Number(input.amount);
      if (
        !Number.isSafeInteger(amount) ||
        amount <= 0 ||
        amount > current.balanceUnits ||
        current.transfers.some(
          (transfer) => transfer.idempotencyKey === input.idempotencyKey,
        )
      )
        return current;
      return {
        ...current,
        balanceUnits: current.balanceUnits - amount,
        transfers: [
          { ...input, createdAt: new Date().toISOString() },
          ...current.transfers,
        ],
      };
    });
  }, []);

  return (
    <DemoContext.Provider
      value={{
        data,
        live,
        startDemo,
        saveDecision,
        completeLesson,
        claimDemoReward,
        transferDemo,
        notify,
      }}
    >
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {message && (
          <div className="toast">
            <CheckCircle2 size={20} />
            <span>{message}</span>
            <button aria-label="Cerrar aviso" onClick={() => setMessage("")}>
              <X size={17} />
            </button>
          </div>
        )}
      </div>
    </DemoContext.Provider>
  );
}
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider");
  return context;
}

function todayKey() {
  return decisionDate(new Date().toISOString());
}

/** Consecutive days (Mexico City calendar) with at least one decision,
 * counting back from today — or from yesterday if today has none yet. */
export function computeStreak(decisions: DecisionRecord[]) {
  const days = new Set(decisions.map((d) => decisionDate(d.createdAt)));
  let cursor = Date.parse(`${todayKey()}T12:00:00Z`);
  if (!days.has(new Date(cursor).toISOString().slice(0, 10)))
    cursor -= 86400000;
  let streak = 0;
  while (days.has(new Date(cursor).toISOString().slice(0, 10))) {
    streak += 1;
    cursor -= 86400000;
  }
  return streak;
}

/** Simple progression: 10 XP per decision, 12 per lesson, 150 XP per level. */
function computeLevel(snapshot: DemoSnapshot) {
  const xp =
    snapshot.decisions.length * 10 + (snapshot.lessonCompleted ? 12 : 0);
  return 1 + Math.floor(xp / 150);
}
