import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { getProvider } from "../services/payments/index.js";
import { PaymentProvider, PaymentStatus, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { config } from "../config.js";

const CreatePaymentSchema = z.object({
  provider: z.enum(["TELEGRAM_STARS", "TON", "USDT_TON", "PORTMONE", "CAPITALIST"]),
  plan: z.enum(["monthly", "quarterly", "yearly", "lifetime"])
});

const PRICE_TABLE: Record<string, { amount: number; currency: string; plan: SubscriptionPlan; months?: number }> = {
  monthly: { amount: 7, currency: "EUR", plan: SubscriptionPlan.PREMIUM, months: 1 },
  quarterly: { amount: 18, currency: "EUR", plan: SubscriptionPlan.PREMIUM, months: 3 },
  yearly: { amount: 60, currency: "EUR", plan: SubscriptionPlan.PREMIUM, months: 12 },
  lifetime: { amount: 120, currency: "EUR", plan: SubscriptionPlan.LIFETIME }
};

export const createPaymentHandler = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = CreatePaymentSchema.parse(req.body);
  const pricing = PRICE_TABLE[payload.plan];
  const provider = getProvider(payload.provider as PaymentProvider);

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      provider: payload.provider as PaymentProvider,
      amount: pricing.amount,
      currency: pricing.currency,
      status: PaymentStatus.PENDING,
      metadata: { plan: payload.plan }
    }
  });

  const response = await provider.createPayment({
    userId: user.id,
    provider: payload.provider as PaymentProvider,
    amount: pricing.amount,
    currency: pricing.currency,
    plan: payload.plan
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { externalId: payment.id }
  });

  return res.json({
    paymentId: payment.id,
    redirectUrl: response.redirectUrl,
    status: response.status,
    message: response.message
  });
};

export const webhookHandler = async (req: Request, res: Response) => {
  const secret = req.headers["x-webhook-secret"]?.toString();
  if (!secret || secret !== config.paymentWebhookSecret) {
    return res.status(401).json({ error: "Invalid webhook secret" });
  }

  const providerName = req.params.provider.toUpperCase();
  const provider = getProvider(providerName as PaymentProvider);

  const signature = req.headers["x-signature"]?.toString();
  const webhookResult = await provider.parseWebhook(req.body, signature);

  const existing = await prisma.payment.findFirst({
    where: { externalId: webhookResult.externalId }
  });

  if (existing && existing.status === PaymentStatus.SUCCESS) {
    return res.json({ ok: true, ignored: true });
  }

  if (!existing && !req.body.userId) {
    return res.status(400).json({ error: "Missing userId for new payment" });
  }

  const payment = existing
    ? await prisma.payment.update({
        where: { id: existing.id },
        data: {
          status:
            webhookResult.status === "success"
              ? PaymentStatus.SUCCESS
              : PaymentStatus.FAILED,
          externalId: webhookResult.externalId,
          metadata: webhookResult.metadata
        }
      })
    : await prisma.payment.create({
        data: {
          userId: req.body.userId,
          provider: providerName as PaymentProvider,
          amount: webhookResult.amount,
          currency: webhookResult.currency,
          status:
            webhookResult.status === "success"
              ? PaymentStatus.SUCCESS
              : PaymentStatus.FAILED,
          externalId: webhookResult.externalId,
          metadata: webhookResult.metadata
        }
      });

  if (payment.status === PaymentStatus.SUCCESS) {
    const plan = payment.metadata?.plan as string | undefined;
    const pricing = plan ? PRICE_TABLE[plan] : null;
    if (pricing) {
      const expiresAt = pricing.months
        ? new Date(Date.now() + pricing.months * 30 * 24 * 60 * 60 * 1000)
        : null;
      await prisma.subscription.upsert({
        where: { userId: payment.userId },
        update: {
          plan: pricing.plan,
          status: SubscriptionStatus.ACTIVE,
          expiresAt
        },
        create: {
          userId: payment.userId,
          plan: pricing.plan,
          status: SubscriptionStatus.ACTIVE,
          expiresAt
        }
      });
    }
  }

  return res.json({ ok: true });
};
