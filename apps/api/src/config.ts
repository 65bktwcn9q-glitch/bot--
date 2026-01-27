import dotenv from "dotenv";

dotenv.config();

const devMode = process.env.DEV_MODE === "true";

const required = (key: string, fallback = "") => {
  const value = process.env[key];
  if (!value && !devMode) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value ?? fallback;
};

export const config = {
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  devMode,
  devUserTelegramId: process.env.DEV_USER_TELEGRAM_ID ?? "999999999",
  telegramBotToken: required("TELEGRAM_BOT_TOKEN", "dev-token"),
  adminIds: (process.env.ADMIN_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),
  deepseekApiKey: required("DEEPSEEK_API_KEY", "dev-key"),
  deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
  freeDailyLimit: Number(process.env.FREE_DAILY_LIMIT ?? 5),
  freeRateLimit: Number(process.env.FREE_RATE_LIMIT_PER_MIN ?? 10),
  vipRateLimit: Number(process.env.VIP_RATE_LIMIT_PER_MIN ?? 60),
  enableAds: process.env.ENABLE_ADS !== "false",
  adsInterval: Number(process.env.ADS_INTERVAL ?? 3),
  paymentWebhookSecret: required("PAYMENT_WEBHOOK_SECRET", "dev-secret"),
  tonReceiverAddress: process.env.TON_RECEIVER_ADDRESS ?? "",
  usdtTonReceiverAddress: process.env.USDT_TON_RECEIVER_ADDRESS ?? "",
  portmoneMerchantId: process.env.PORTMONE_MERCHANT_ID ?? "",
  portmoneSecret: process.env.PORTMONE_SECRET ?? "",
  capitalistApiKey: process.env.CAPITALIST_API_KEY ?? "",
  capitalistSecret: process.env.CAPITALIST_SECRET ?? "",
  telegramStarsProviderToken: process.env.TELEGRAM_STARS_PROVIDER_TOKEN ?? ""
};
