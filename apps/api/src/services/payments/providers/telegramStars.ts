import { config } from "../../../config.js";
import { PaymentProvider } from "@prisma/client";
import { PaymentProviderAdapter, PaymentRequest, PaymentResponse, WebhookResult } from "../types.js";
import { z } from "zod";

const WebhookSchema = z.object({
  charge_id: z.string(),
  status: z.enum(["paid", "failed"]),
  amount: z.number(),
  currency: z.string()
});

export class TelegramStarsProvider implements PaymentProviderAdapter {
  provider = PaymentProvider.TELEGRAM_STARS;

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!config.telegramStarsProviderToken) {
      return {
        paymentId: "",
        status: "failed",
        message: "Telegram Stars is not configured"
      };
    }
    return {
      paymentId: "pending",
      status: "pending",
      message: `Use Telegram Bot API with provider token ${config.telegramStarsProviderToken} to generate invoice for ${request.amount} ${request.currency}`
    };
  }

  async parseWebhook(payload: unknown): Promise<WebhookResult> {
    const data = WebhookSchema.parse(payload);
    return {
      externalId: data.charge_id,
      status: data.status === "paid" ? "success" : "failed",
      amount: data.amount,
      currency: data.currency
    };
  }
}
