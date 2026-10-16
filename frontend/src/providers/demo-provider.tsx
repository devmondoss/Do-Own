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
import type {
  DecisionInput,
  DemoSnapshot,
  TransferInput,
} from "@/types/do-own";

interface DemoContextValue {
  data: DemoSnapshot;
  startDemo: (name: string) => void;
  saveDecision: (input: DecisionInput) => void;
  completeLesson: () => void;
  claimDemoReward: (id: string) => void;
  transferDemo: (input: TransferInput) => void;
  notify: (message: string) => void;
}
const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  // TODO(BACKEND): replace memory-only state with authenticated server data.
  // Names, photos and financial records never enter browser persistent storage.
  const [data, setData] = useState<DemoSnapshot>(initialDemo);
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

  const startDemo = useCallback((name: string) => {
    setData((current) => ({
      ...current,
      profile: { ...current.profile, name: name.trim() || "Ana" },
      onboardingComplete: true,
    }));
  }, []);

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
