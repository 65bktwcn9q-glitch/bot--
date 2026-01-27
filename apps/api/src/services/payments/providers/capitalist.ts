import { config } from "../../../config.js";
import { PaymentProvider } from "@prisma/client";
import { PaymentProviderAdapter, PaymentRequest, PaymentResponse, WebhookResult } from "../types.js";
import { z } from "zod";

const CapitalistWebhookSchema = z.object({
  operation_id: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(["success", "failed"])
});

export class CapitalistProvider implements PaymentProviderAdapter {
  provider = PaymentProvider.CAPITALIST;

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!config.capitalistApiKey || !config.capitalistSecret) {
      return {
        paymentId: "",
        status: "failed",
        message: "Capitalist is not configured"
      };
    }
    return {
      paymentId: "pending",
      status: "pending",
      redirectUrl: `https://capitalist.net/pay?amount=${request.amount}&currency=${request.currency}`,
      message: "Redirect to Capitalist checkout"
    };
  }

  async parseWebhook(payload: unknown): Promise<WebhookResult> {
    const data = CapitalistWebhookSchema.parse(payload);
    return {
      externalId: data.operation_id,
      status: data.status,
      amount: data.amount,
      currency: data.currency
    };
  }
}
