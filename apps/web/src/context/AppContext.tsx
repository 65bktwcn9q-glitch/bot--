import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
import { useTelegram } from "../hooks/useTelegram";

export type UserProfile = {
  id: string;
  telegramId: string;
  level: string;
  goal: string;
  language: string;
  points: number;
  streak: number;
  dailyTaskCount: number;
  subscription?: {
    plan: string;
    status: string;
    expiresAt?: string | null;
  } | null;
};

export type MonetizationConfig = {
  freeDailyLimit: number;
  adsEnabled: boolean;
  adsInterval: number;
};

type AppContextValue = {
  user?: UserProfile;
  vip: boolean;
  monetization?: MonetizationConfig;
  refresh: () => Promise<void>;
};

const AppContext = createContext<AppContextValue>({
  vip: false,
  refresh: async () => undefined
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initData } = useTelegram();
  const [user, setUser] = useState<UserProfile>();
  const [vip, setVip] = useState(false);
  const [monetization, setMonetization] = useState<MonetizationConfig>();

  const refresh = async () => {
    if (!initData) return;
    try {
      const response = await api.profile(initData);
      setUser(response.user as UserProfile);
      setVip(Boolean(response.vip));
      setMonetization(response.monetization as MonetizationConfig);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    void refresh();
  }, [initData]);

  return (
    <AppContext.Provider value={{ user, vip, monetization, refresh }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
