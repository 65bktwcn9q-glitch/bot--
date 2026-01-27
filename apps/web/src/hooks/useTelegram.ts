import { useEffect, useMemo, useState } from "react";

export type TelegramThemeParams = Record<string, string>;

export type TelegramWebApp = {
  initData: string;
  themeParams: TelegramThemeParams;
  colorScheme: "light" | "dark";
  MainButton: {
    text: string;
    color?: string;
    textColor?: string;
    isVisible: boolean;
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy") => void;
  };
  expand: () => void;
  ready: () => void;
  close: () => void;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const useTelegram = () => {
  const webApp = useMemo(() => window.Telegram?.WebApp, []);
  const [theme, setTheme] = useState<TelegramThemeParams>({});

  useEffect(() => {
    if (webApp) {
      setTheme(webApp.themeParams || {});
      webApp.ready();
      webApp.expand();
    }
  }, [webApp]);

  return {
    webApp,
    initData: webApp?.initData || new URLSearchParams(window.location.search).get("initData") || "",
    theme
  };
};
