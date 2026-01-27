import { config } from "../../../config.js";
import { PaymentProvider } from "@prisma/client";
import { PaymentProviderAdapter, PaymentRequest, PaymentResponse, WebhookResult } from "../types.js";
import { z } from "zod";

const PortmoneWebhookSchema = z.object({
  order_id: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(["success", "failed"])
});

export class PortmoneProvider implements PaymentProviderAdapter {
  provider = PaymentProvider.PORTMONE;

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!config.portmoneMerchantId || !config.portmoneSecret) {
      return {
        paymentId: "",
        status: "failed",
        message: "Portmone is not configured"
      };
    }
    return {
      paymentId: "pending",
      status: "pending",
      redirectUrl: `https://www.portmone.com.ua/gateway/?merchant_id=${config.portmoneMerchantId}&amount=${request.amount}&currency=${request.currency}`,
      message: "Redirect to Portmone checkout"
    };
  }

  async parseWebhook(payload: unknown): Promise<WebhookResult> {
    const data = PortmoneWebhookSchema.parse(payload);
    return {
      externalId: data.order_id,
      status: data.status,
      amount: data.amount,
      currency: data.currency
    };
  }
}
