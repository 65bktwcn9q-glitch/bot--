import { PaymentProvider } from "@prisma/client";
import { PaymentProviderAdapter } from "./types.js";
import { TelegramStarsProvider } from "./providers/telegramStars.js";
import { TonProvider } from "./providers/ton.js";
import { UsdtTonProvider } from "./providers/usdtTon.js";
import { PortmoneProvider } from "./providers/portmone.js";
import { CapitalistProvider } from "./providers/capitalist.js";

const providers: PaymentProviderAdapter[] = [
  new TelegramStarsProvider(),
  new TonProvider(),
  new UsdtTonProvider(),
  new PortmoneProvider(),
  new CapitalistProvider()
];

export const getProvider = (provider: PaymentProvider) => {
  const adapter = providers.find((item) => item.provider === provider);
  if (!adapter) {
    throw new Error(`Provider ${provider} not supported`);
  }
  return adapter;
};
