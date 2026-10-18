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
import type { PublicStellarConfig } from "@/lib/stellar/config";
import type {
  RewardResult,
  SealReceipt,
  SealedRecord,
  StoredWallet,
  WalletPayment,
} from "@/lib/stellar/client";
import type { DecisionRecord } from "@/types/do-own";

const wallet = () => import("@/lib/stellar/client");
const SEALS_KEY = "do-own.seals.v1";
const REWARDS_KEY = "do-own.rewards.v1";

export type WalletStatus =
  | "loading" // reading config
  | "disabled" // server has no Stellar config → demo mode
  | "none" // no key on this device yet
  | "creating" // generating key + sponsored account
  | "ready"
  | "error";

interface WalletContextValue {
  config: PublicStellarConfig | null;
  status: WalletStatus;
  enabled: boolean;
  publicKey: string | null;
  balance: string;
  payments: WalletPayment[];
  seals: SealReceipt[];
  rewardReceipts: Record<string, RewardResult>;
  sessionSeal: { root: string; sealed: SealedRecord[] } | null;
  error: string;
  onboardingTx: string | null;
  ensureAccount: () => Promise<string | null>;
  claim: (rewardId: string) => Promise<RewardResult>;
  transfer: (destination: string, amount: string) => Promise<string>;
  sealWeek: (records: DecisionRecord[]) => Promise<SealReceipt>;
  refresh: () => Promise<void>;
  backupSecret: () => string | null;
  restore: (secret: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore: private mode */
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PublicStellarConfig | null>(null);
  const [status, setStatus] = useState<WalletStatus>("loading");
  const [stored, setStored] = useState<StoredWallet | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState("0");
  const [payments, setPayments] = useState<WalletPayment[]>([]);
  // Only hashes, dates and counts are persisted — never amounts or notes.
  const [seals, setSeals] = useState<SealReceipt[]>([]);
  const [rewardReceipts, setRewardReceipts] = useState<
    Record<string, RewardResult>
  >({});
  const [sessionSeal, setSessionSeal] = useState<{
    root: string;
    sealed: SealedRecord[];
  } | null>(null);
  const [error, setError] = useState("");
  const [onboardingTx, setOnboardingTx] = useState<string | null>(null);
  const pending = useRef<Promise<string | null> | null>(null);

  const refreshFor = useCallback(
    async (key: string, cfg: PublicStellarConfig) => {
      const lib = await wallet();
      const [state, list] = await Promise.all([
        lib.getAccountState(key, cfg),
        lib.getPayments(key, cfg),
      ]);
      setBalance(state.balance);
      setPayments(list);
      return state;
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const lib = await wallet();
      const cfg = await lib.fetchConfig();
      if (cancelled) return;
      if (!cfg?.enabled) {
        setStatus("disabled");
        return;
      }
      setConfig(cfg);
      setSeals(readJson(SEALS_KEY, []));
      setRewardReceipts(readJson(REWARDS_KEY, {}));
      const existing = lib.loadStoredWallet();
      if (!existing) {
        setStatus("none");
        return;
      }
      setStored(existing);
      const key = await lib.publicKeyOf(existing);
      if (cancelled) return;
      setPublicKey(key);
      try {
        const state = await refreshFor(key, cfg);
        setStatus(state.ready ? "ready" : "none");
      } catch {
        setStatus("error");
        setError("No pudimos consultar tu cuenta. Revisa tu conexión.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshFor]);

  const ensureAccount = useCallback(async () => {
    if (!config) return null;
    if (status === "ready" && publicKey) return publicKey;
    if (pending.current) return pending.current;
    pending.current = (async () => {
      setStatus("creating");
      setError("");
      try {
        const lib = await wallet();
        const w = stored ?? (await lib.createWallet());
        setStored(w);
        const key = await lib.publicKeyOf(w);
        setPublicKey(key);
        const hash = await lib.onboard(w);
        if (hash) setOnboardingTx(hash);
        await refreshFor(key, config);
        setStatus("ready");
        return key;
      } catch (e) {
        setStatus("error");
        setError(
          e instanceof Error
            ? e.message
            : "No pudimos activar tu cuenta. Intenta de nuevo.",
        );
        return null;
      } finally {
        pending.current = null;
      }
    })();
    return pending.current;
  }, [config, publicKey, refreshFor, status, stored]);

  const claim = useCallback(
    async (rewardId: string) => {
      const key = await ensureAccount();
      if (!key || !config) throw new Error("Tu cuenta no está lista todavía.");
      const lib = await wallet();
      const result = await lib.claimReward(key, rewardId);
      setRewardReceipts((current) => {
        const next = { ...current, [rewardId]: result };
        writeJson(REWARDS_KEY, next);
        return next;
      });
      await refreshFor(key, config);
      return result;
    },
    [config, ensureAccount, refreshFor],
  );

  const transfer = useCallback(
    async (destination: string, amount: string) => {
      const key = await ensureAccount();
      if (!key || !config || !stored)
        throw new Error("Tu cuenta no está lista.");
      const lib = await wallet();
      const result = await lib.sendDown(stored, config, destination, amount);
      await refreshFor(key, config);
      return result.transactionHash;
    },
    [config, ensureAccount, refreshFor, stored],
  );

  const sealWeek = useCallback(
    async (records: DecisionRecord[]) => {
      const key = await ensureAccount();
      if (!key || !stored) throw new Error("Tu cuenta no está lista.");
      const lib = await wallet();
      const sealed = await lib.commitRecords(records);
      const root = await lib.merkleRoot(sealed.map((s) => s.commitment));
      const result = await lib.anchorRoot(stored, root);
      const receipt: SealReceipt = {
        root,
        transactionHash: result.transactionHash,
        explorerUrl: result.explorerUrl,
        createdAt: result.createdAt,
        records: records.length,
      };
      setSessionSeal({ root, sealed });
      setSeals((current) => {
        const next = [receipt, ...current].slice(0, 20);
        writeJson(SEALS_KEY, next);
        return next;
      });
      return receipt;
    },
    [ensureAccount, stored],
  );

  const refresh = useCallback(async () => {
    if (publicKey && config) await refreshFor(publicKey, config);
  }, [config, publicKey, refreshFor]);

  const backupSecret = useCallback(() => stored?.secret ?? null, [stored]);

  const restore = useCallback(
    async (secret: string) => {
      if (!config) return;
      const lib = await wallet();
      const w = await lib.importWallet(secret);
      setStored(w);
      const key = await lib.publicKeyOf(w);
      setPublicKey(key);
      const state = await refreshFor(key, config);
      setStatus(state.ready ? "ready" : "none");
    },
    [config, refreshFor],
  );

  return (
    <WalletContext.Provider
      value={{
        config,
        status,
        enabled: status !== "disabled" && status !== "loading",
        publicKey,
        balance,
        payments,
        seals,
        rewardReceipts,
        sessionSeal,
        error,
        onboardingTx,
        ensureAccount,
        claim,
        transfer,
        sealWeek,
        refresh,
        backupSecret,
        restore,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used inside WalletProvider");
  return context;
}

/** "12.0000000" → "12" for display. */
export function formatDown(value: string) {
  const n = Number(value);
  return Number.isFinite(n)
    ? n.toLocaleString("es-MX", { maximumFractionDigits: 2 })
    : value;
}
