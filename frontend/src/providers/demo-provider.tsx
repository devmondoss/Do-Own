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
import { computeStreak, earnedPeriodRewards, todayKey } from "@/lib/periods";
import { deleteEvidence, saveEvidence } from "@/lib/evidence-store";
import { duplicateReason } from "@/lib/duplicates";
import type {
  DecisionInput,
  DemoSnapshot,
  TransferInput,
} from "@/types/do-own";

interface DemoContextValue {
  data: DemoSnapshot;
  /** true when the server has the Stellar wallet configured: real, persisted data. */
  live: boolean;
  /** false until this device's saved data has been read (live mode). */
  hydrated: boolean;
  startDemo: (name: string, email?: string) => void;
  /** Saves the record; a repeated operation is kept but earns no reward. */
  saveDecision: (input: DecisionInput) => {
    rewarded: boolean;
    reason?: string;
  };
  /** Attach, replace (file) or remove (null) the evidence photo of a record. */
  setEvidence: (recordId: string, file: File | null) => Promise<void>;
  completeLesson: (lessonId?: string) => void;
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
  lessonsCompleted: [],
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

  // Period rewards (weekly / monthly constancy) appear as "available" as soon
  // as their rules are met. Their ids are deterministic, so they are only
  // ever added once and the server can never pay them twice.
  useEffect(() => {
    if (!hydrated) return;
    const earned = earnedPeriodRewards(state.decisions);
    const missing = earned.filter(
      (reward) => !state.rewards.some((r) => r.id === reward.id),
    );
    if (!missing.length) return;
    const now = new Date().toISOString();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- derived rewards are appended once
    setData((current) => ({
      ...current,
      rewards: [
        ...current.rewards,
        ...missing
          .filter((m) => !current.rewards.some((r) => r.id === m.id))
          .map((m) => ({ ...m, createdAt: now })),
      ],
    }));
  }, [hydrated, state.decisions, state.rewards]);

  const startDemo = useCallback((name: string, email?: string) => {
    setData((current) => ({
      ...current,
      profile: {
        ...current.profile,
        // The welcome form requires a name; keep the previous one only as
        // a safety net so a profile never ends up without a name.
        name: name.trim().slice(0, 40) || current.profile.name || "Ana",
        ...(email?.trim() ? { email: email.trim() } : {}),
      },
      onboardingComplete: true,
    }));
  }, []);

  const saveDecision = useCallback(
    (input: DecisionInput) => {
      const id = crypto.randomUUID();
      const { attachment, ...privateFields } = input;
      const reason = duplicateReason(state.decisions, input);
      // F02: the photo stays on this device (IndexedDB), never uploaded.
      if (attachment) void saveEvidence(id, attachment);
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
            ...(reason ? { duplicate: true, duplicateReason: reason } : {}),
          },
          ...current.decisions,
        ],
        rewards: reason
          ? current.rewards
          : [
              ...current.rewards,
              {
                id: `record-${id}`,
                reason: "registro",
                units: 1,
                status: "available",
                createdAt: new Date().toISOString(),
              },
            ],
      }));
      return reason ? { rewarded: false, reason } : { rewarded: true };
    },
    [state.decisions],
  );

  const setEvidence = useCallback(
    async (recordId: string, file: File | null) => {
      if (file) await saveEvidence(recordId, file);
      else await deleteEvidence(recordId);
      setData((current) => ({
        ...current,
        decisions: current.decisions.map((d) =>
          d.id === recordId ? { ...d, photoAttached: !!file } : d,
        ),
      }));
    },
    [],
  );

  const completeLesson = useCallback((lessonId = "antojo-v1") => {
    // TODO(BACKEND): validate answers and award a lesson only once on the server.
    setData((current) => {
      const done =
        current.lessonsCompleted ??
        (current.lessonCompleted ? ["antojo-v1"] : []);
      const actions = Array.from(
        new Set([...current.completedActions, "lesson" as const]),
      );
      if (done.includes(lessonId))
        return { ...current, completedActions: actions };
      return {
        ...current,
        lessonCompleted: current.lessonCompleted || lessonId === "antojo-v1",
        lessonsCompleted: [...done, lessonId],
        completedActions: actions,
        rewards: [
          ...current.rewards,
          {
            id: `lesson-${lessonId}`,
            reason: "aprendizaje",
            units: 1,
            status: "available",
            createdAt: new Date().toISOString(),
          },
        ],
      };
    });
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
          reward.id === id
            ? {
                ...reward,
                status: "claimed" as const,
                claimedAt: new Date().toISOString(),
              }
            : reward,
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
        hydrated,
        startDemo,
        saveDecision,
        setEvidence,
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

/** Simple progression: 10 XP per decision, 12 per lesson, 150 XP per level. */
function computeLevel(snapshot: DemoSnapshot) {
  const lessonsDone =
    snapshot.lessonsCompleted?.length ?? (snapshot.lessonCompleted ? 1 : 0);
  const xp = snapshot.decisions.length * 10 + lessonsDone * 12;
  return 1 + Math.floor(xp / 150);
}
