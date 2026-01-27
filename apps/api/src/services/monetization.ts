import { prisma } from "../lib/prisma.js";
import { config as envConfig } from "../config.js";

export type MonetizationConfig = {
  freeDailyLimit: number;
  adsEnabled: boolean;
  adsInterval: number;
};

export const loadMonetizationConfig = async (): Promise<MonetizationConfig> => {
  const defaultConfig = {
    freeDailyLimit: envConfig.freeDailyLimit,
    adsEnabled: envConfig.enableAds,
    adsInterval: envConfig.adsInterval
  };

  const row = await prisma.appConfig.findUnique({ where: { key: "monetization" } });
  if (!row) return defaultConfig;

  try {
    const parsed = JSON.parse(row.value) as MonetizationConfig;
    return { ...defaultConfig, ...parsed };
  } catch {
    return defaultConfig;
  }
};
