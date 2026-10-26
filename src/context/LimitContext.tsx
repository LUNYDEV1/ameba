import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db, doc, setDoc } from '../firebase';

export type TariffTier = 'free' | 'super' | 'ultima';

export interface TariffInfo {
  tier: TariffTier;
  name: string;
  price: string;
  multiplier: string;
  maxTokens: number;
  timeEstimate: string;
  projectEstimate: string;
  description: string;
  badge: string;
}

export const TARIFFS: Record<TariffTier, TariffInfo> = {
  free: {
    tier: 'free',
    name: 'БЕСПЛАТНЫЙ',
    price: '0 ₽ / мес',
    multiplier: 'Базовый (x1)',
    maxTokens: 50000,
    timeEstimate: '~30-40 минут общения',
    projectEstimate: '1 один проект',
    description: 'Идеально для первого знакомства и небольших задач.',
    badge: 'Базовый',
  },
  super: {
    tier: 'super',
    name: 'SUPER',
    price: '499 ₽ / мес',
    multiplier: 'x10 лимиты',
    maxTokens: 500000,
    timeEstimate: '~6 часов общения',
    projectEstimate: '10 крупных проектов',
    description: 'Для активной работы, написания кода и глубоких исследований.',
    badge: 'x10 ЛИМИТЫ',
  },
  ultima: {
    tier: 'ultima',
    name: 'ULTIMA',
    price: '899 ₽ / мес',
    multiplier: 'x20 лимиты',
    maxTokens: 1000000,
    timeEstimate: '~13 часов общения',
    projectEstimate: '20+ проектов любой сложности',
    description: 'Максимальные лимиты, приоритетная скорость и работа без ограничений.',
    badge: 'x20 ЛИМИТЫ',
  },
};

/**
 * Calculates current 8:00 MSK reset cycle ID (YYYY-MM-DD).
 * 8:00 MSK corresponds to 05:00 UTC.
 */
export function getMskResetCycleId(date: Date = new Date()): string {
  const d = new Date(date.getTime() - 5 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

/**
 * Returns time string remaining until next 08:00 MSK reset.
 */
export function getTimeUntilMskReset(): string {
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(5, 0, 0, 0);
  if (now.getTime() >= target.getTime()) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  const diffMs = Math.max(0, target.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours} ч ${mins} мин`;
}

interface LimitContextType {
  tariff: TariffTier;
  tariffInfo: TariffInfo;
  usedTokens: number;
  maxTokens: number;
  remainingTokens: number;
  percentRemaining: number;
  percentUsed: number;
  isLimitReached: boolean;
  timeUntilReset: string;
  addTokenUsage: (amount: number) => void;
  setTariff: (tier: TariffTier) => Promise<void>;
  resetTokens: () => void;
  formatTokens: (num: number) => string;
}

const STORAGE_TARIFF_KEY = 'ameba_tariff_tier_v1';
const STORAGE_USED_TOKENS_KEY = 'ameba_used_tokens_v1';
const STORAGE_LAST_RESET_CYCLE_KEY = 'ameba_last_reset_cycle_v1';

const LimitContext = createContext<LimitContextType | undefined>(undefined);

export const LimitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [timeUntilReset, setTimeUntilReset] = useState<string>(getTimeUntilMskReset());

  const [tariff, setTariffState] = useState<TariffTier>(() => {
    const saved = localStorage.getItem(STORAGE_TARIFF_KEY);
    if (saved === 'super' || saved === 'ultima' || saved === 'free') return saved;
    return 'free';
  });

  const [usedTokens, setUsedTokens] = useState<number>(() => {
    const currentCycle = getMskResetCycleId();
    const storedCycle = localStorage.getItem(STORAGE_LAST_RESET_CYCLE_KEY);
    if (storedCycle !== currentCycle) {
      localStorage.setItem(STORAGE_LAST_RESET_CYCLE_KEY, currentCycle);
      localStorage.setItem(STORAGE_USED_TOKENS_KEY, '0');
      return 0;
    }
    const saved = localStorage.getItem(STORAGE_USED_TOKENS_KEY);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const syncToCloud = async (newTariff: TariffTier, newUsed: number, cycleId?: string) => {
    if (user?.uid) {
      try {
        const currentCycle = cycleId || getMskResetCycleId();
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          tariff: newTariff,
          usedTokens: newUsed,
          lastResetCycle: currentCycle,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.warn('Could not sync limits to Firestore:', err);
      }
    }
  };

  // Sync with Firestore profile when user profile changes (real-time cross-device updates)
  useEffect(() => {
    if (!userProfile) return;

    const currentCycle = getMskResetCycleId();

    if (userProfile.tariff && (userProfile.tariff === 'free' || userProfile.tariff === 'super' || userProfile.tariff === 'ultima')) {
      setTariffState(userProfile.tariff as TariffTier);
    }

    // Check if daily 8:00 MSK reset is required for logged-in user
    if (userProfile.lastResetCycle !== currentCycle) {
      setUsedTokens(0);
      localStorage.setItem(STORAGE_LAST_RESET_CYCLE_KEY, currentCycle);
      localStorage.setItem(STORAGE_USED_TOKENS_KEY, '0');
      syncToCloud(userProfile.tariff as TariffTier || tariff, 0, currentCycle);
    } else if (typeof userProfile.usedTokens === 'number') {
      setUsedTokens(userProfile.usedTokens);
      localStorage.setItem(STORAGE_USED_TOKENS_KEY, userProfile.usedTokens.toString());
      localStorage.setItem(STORAGE_LAST_RESET_CYCLE_KEY, currentCycle);
    }
  }, [userProfile]);

  // Periodic check (every 30s) for 08:00 MSK daily reset & countdown timer update
  useEffect(() => {
    const checkReset = () => {
      setTimeUntilReset(getTimeUntilMskReset());
      const currentCycle = getMskResetCycleId();
      const storedCycle = localStorage.getItem(STORAGE_LAST_RESET_CYCLE_KEY);
      
      if (storedCycle !== currentCycle) {
        localStorage.setItem(STORAGE_LAST_RESET_CYCLE_KEY, currentCycle);
        localStorage.setItem(STORAGE_USED_TOKENS_KEY, '0');
        setUsedTokens(0);
        if (user?.uid) {
          syncToCloud(tariff, 0, currentCycle);
        }
      }
    };

    checkReset();
    const interval = setInterval(checkReset, 30000);
    return () => clearInterval(interval);
  }, [user, tariff]);

  const tariffInfo = TARIFFS[tariff];
  const maxTokens = tariffInfo.maxTokens;
  const remainingTokens = Math.max(0, maxTokens - usedTokens);
  const percentRemaining = Math.max(0, Math.min(100, Math.round((remainingTokens / maxTokens) * 100)));
  const percentUsed = 100 - percentRemaining;
  const isLimitReached = usedTokens >= maxTokens;

  const addTokenUsage = (amount: number) => {
    setUsedTokens((prev) => {
      const currentCycle = getMskResetCycleId();
      const next = prev + amount;
      localStorage.setItem(STORAGE_USED_TOKENS_KEY, next.toString());
      localStorage.setItem(STORAGE_LAST_RESET_CYCLE_KEY, currentCycle);
      syncToCloud(tariff, next, currentCycle);
      return next;
    });
  };

  const setTariff = async (newTier: TariffTier) => {
    setTariffState(newTier);
    localStorage.setItem(STORAGE_TARIFF_KEY, newTier);
    const currentCycle = getMskResetCycleId();
    await syncToCloud(newTier, usedTokens, currentCycle);
  };

  const resetTokens = () => {
    const currentCycle = getMskResetCycleId();
    setUsedTokens(0);
    localStorage.setItem(STORAGE_USED_TOKENS_KEY, '0');
    localStorage.setItem(STORAGE_LAST_RESET_CYCLE_KEY, currentCycle);
    syncToCloud(tariff, 0, currentCycle);
  };

  const formatTokens = (num: number): string => {
    return num.toLocaleString('ru-RU');
  };

  return (
    <LimitContext.Provider
      value={{
        tariff,
        tariffInfo,
        usedTokens,
        maxTokens,
        remainingTokens,
        percentRemaining,
        percentUsed,
        isLimitReached,
        timeUntilReset,
        addTokenUsage,
        setTariff,
        resetTokens,
        formatTokens,
      }}
    >
      {children}
    </LimitContext.Provider>
  );
};

export const useLimits = () => {
  const ctx = useContext(LimitContext);
  if (!ctx) {
    throw new Error('useLimits must be used within a LimitProvider');
  }
  return ctx;
};

