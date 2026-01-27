import { PaymentProvider } from "@prisma/client";

export type PaymentRequest = {
  userId: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  plan: "monthly" | "quarterly" | "yearly" | "lifetime";
};

export type PaymentResponse = {
  paymentId: string;
  status: "pending" | "success" | "failed";
  redirectUrl?: string;
  message?: string;
};

export type WebhookResult = {
  externalId: string;
  status: "success" | "failed";
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
};

export interface PaymentProviderAdapter {
  provider: PaymentProvider;
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  parseWebhook(payload: unknown, signature?: string): Promise<WebhookResult>;
}
