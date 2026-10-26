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

interface LimitContextType {
  tariff: TariffTier;
  tariffInfo: TariffInfo;
  usedTokens: number;
  maxTokens: number;
  remainingTokens: number;
  percentRemaining: number;
  percentUsed: number;
  isLimitReached: boolean;
  addTokenUsage: (amount: number) => void;
  setTariff: (tier: TariffTier) => Promise<void>;
  resetTokens: () => void;
  formatTokens: (num: number) => string;
}

const STORAGE_TARIFF_KEY = 'ameba_tariff_tier_v1';
const STORAGE_USED_TOKENS_KEY = 'ameba_used_tokens_v1';

const LimitContext = createContext<LimitContextType | undefined>(undefined);

export const LimitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();

  const [tariff, setTariffState] = useState<TariffTier>(() => {
    const saved = localStorage.getItem(STORAGE_TARIFF_KEY);
    if (saved === 'super' || saved === 'ultima' || saved === 'free') return saved;
    return 'free';
  });

  const [usedTokens, setUsedTokens] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_USED_TOKENS_KEY);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  // Sync with Firestore profile when user profile changes
  useEffect(() => {
    if (userProfile?.tariff && (userProfile.tariff === 'free' || userProfile.tariff === 'super' || userProfile.tariff === 'ultima')) {
      setTariffState(userProfile.tariff as TariffTier);
    }
    if (typeof userProfile?.usedTokens === 'number') {
      setUsedTokens(userProfile.usedTokens);
    }
  }, [userProfile]);

  const tariffInfo = TARIFFS[tariff];
  const maxTokens = tariffInfo.maxTokens;
  const remainingTokens = Math.max(0, maxTokens - usedTokens);
  const percentRemaining = Math.max(0, Math.min(100, Math.round((remainingTokens / maxTokens) * 100)));
  const percentUsed = 100 - percentRemaining;
  const isLimitReached = usedTokens >= maxTokens;

  const syncToCloud = async (newTariff: TariffTier, newUsed: number) => {
    if (user?.uid) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          tariff: newTariff,
          usedTokens: newUsed,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.warn('Could not sync limits to Firestore:', err);
      }
    }
  };

  const addTokenUsage = (amount: number) => {
    setUsedTokens((prev) => {
      const next = prev + amount;
      localStorage.setItem(STORAGE_USED_TOKENS_KEY, next.toString());
      syncToCloud(tariff, next);
      return next;
    });
  };

  const setTariff = async (newTier: TariffTier) => {
    setTariffState(newTier);
    localStorage.setItem(STORAGE_TARIFF_KEY, newTier);
    await syncToCloud(newTier, usedTokens);
  };

  const resetTokens = () => {
    setUsedTokens(0);
    localStorage.setItem(STORAGE_USED_TOKENS_KEY, '0');
    syncToCloud(tariff, 0);
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
