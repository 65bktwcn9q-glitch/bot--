import { config } from "../../../config.js";
import { PaymentProvider } from "@prisma/client";
import { PaymentProviderAdapter, PaymentRequest, PaymentResponse, WebhookResult } from "../types.js";
import { z } from "zod";

const UsdtWebhookSchema = z.object({
  tx_hash: z.string(),
  amount: z.number(),
  currency: z.string().default("USDT"),
  status: z.enum(["success", "failed"])
});

export class UsdtTonProvider implements PaymentProviderAdapter {
  provider = PaymentProvider.USDT_TON;

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!config.usdtTonReceiverAddress) {
      return {
        paymentId: "",
        status: "failed",
        message: "USDT TON receiver address not configured"
      };
    }
    return {
      paymentId: "pending",
      status: "pending",
      redirectUrl: `ton://transfer/${config.usdtTonReceiverAddress}?amount=${request.amount}&jetton=USDT`,
      message: "Open TON wallet to pay USDT on TON"
    };
  }

  async parseWebhook(payload: unknown): Promise<WebhookResult> {
    const data = UsdtWebhookSchema.parse(payload);
    return {
      externalId: data.tx_hash,
      status: data.status,
      amount: data.amount,
      currency: data.currency
    };
  }
}
