import crypto from "crypto";

export type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

export type InitData = {
  user?: TelegramUser;
  hash: string;
  auth_date: string;
  [key: string]: string | TelegramUser | undefined;
};

export const parseInitData = (initData: string): InitData => {
  const params = new URLSearchParams(initData);
  const data: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    data[key] = value;
  }
  if (data.user) {
    data.user = JSON.parse(data.user);
  }
  return data as InitData;
};

export const validateInitData = (initData: string, botToken: string): boolean => {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash") ?? "";
  const dataCheckString = Array.from(params.entries())
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return computedHash === hash;
};
