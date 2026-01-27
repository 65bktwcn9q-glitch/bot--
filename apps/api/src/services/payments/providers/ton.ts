import { config } from "../../../config.js";
import { PaymentProvider } from "@prisma/client";
import { PaymentProviderAdapter, PaymentRequest, PaymentResponse, WebhookResult } from "../types.js";
import { z } from "zod";

const TonWebhookSchema = z.object({
  tx_hash: z.string(),
  amount: z.number(),
  currency: z.string().default("TON"),
  status: z.enum(["success", "failed"])
});

export class TonProvider implements PaymentProviderAdapter {
  provider = PaymentProvider.TON;

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!config.tonReceiverAddress) {
      return {
        paymentId: "",
        status: "failed",
        message: "TON receiver address not configured"
      };
    }
    return {
      paymentId: "pending",
      status: "pending",
      redirectUrl: `ton://transfer/${config.tonReceiverAddress}?amount=${request.amount}`,
      message: "Open TON wallet to complete the payment"
    };
  }

  async parseWebhook(payload: unknown): Promise<WebhookResult> {
    const data = TonWebhookSchema.parse(payload);
    return {
      externalId: data.tx_hash,
      status: data.status,
      amount: data.amount,
      currency: data.currency
    };
  }
}
