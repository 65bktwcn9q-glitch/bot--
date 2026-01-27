import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

const VipSchema = z.object({
  telegramId: z.string(),
  plan: z.enum(["PREMIUM", "LIFETIME"]),
  expiresAt: z.string().optional()
});

const AdSchema = z.object({
  type: z.enum(["BANNER", "FULLSCREEN"]),
  title: z.string(),
  text: z.string(),
  imageUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  isActive: z.boolean().optional()
});

const MonetizationSchema = z.object({
  freeDailyLimit: z.number().min(1).max(50),
  adsEnabled: z.boolean(),
  adsInterval: z.number().min(1).max(10)
});

export const listUsersHandler = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: { subscription: true, payments: true }
  });
  return res.json({ users });
};

export const setVipHandler = async (req: Request, res: Response) => {
  const payload = VipSchema.parse(req.body);
  const user = await prisma.user.findUnique({
    where: { telegramId: payload.telegramId }
  });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const expiresAt = payload.expiresAt ? new Date(payload.expiresAt) : null;

  const subscription = await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      plan: payload.plan as SubscriptionPlan,
      status: SubscriptionStatus.ACTIVE,
      expiresAt
    },
    create: {
      userId: user.id,
      plan: payload.plan as SubscriptionPlan,
      status: SubscriptionStatus.ACTIVE,
      expiresAt
    }
  });

  return res.json({ subscription });
};

export const revokeVipHandler = async (req: Request, res: Response) => {
  const payload = z.object({ telegramId: z.string() }).parse(req.body);
  const user = await prisma.user.findUnique({
    where: { telegramId: payload.telegramId }
  });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  await prisma.subscription.update({
    where: { userId: user.id },
    data: { status: SubscriptionStatus.EXPIRED }
  });

  return res.json({ ok: true });
};

export const listAdsHandler = async (_req: Request, res: Response) => {
  const ads = await prisma.ad.findMany({ orderBy: { createdAt: "desc" } });
  return res.json({ ads });
};

export const createAdHandler = async (req: Request, res: Response) => {
  const payload = AdSchema.parse(req.body);
  const ad = await prisma.ad.create({ data: payload });
  return res.json({ ad });
};

export const updateAdHandler = async (req: Request, res: Response) => {
  const payload = AdSchema.partial().parse(req.body);
  const ad = await prisma.ad.update({
    where: { id: req.params.id },
    data: payload
  });
  return res.json({ ad });
};

export const deleteAdHandler = async (req: Request, res: Response) => {
  await prisma.ad.delete({ where: { id: req.params.id } });
  return res.json({ ok: true });
};

export const updateMonetizationHandler = async (req: Request, res: Response) => {
  const payload = MonetizationSchema.parse(req.body);
  await prisma.appConfig.upsert({
    where: { key: "monetization" },
    update: { value: JSON.stringify(payload) },
    create: { key: "monetization", value: JSON.stringify(payload) }
  });
  return res.json({ ok: true });
};

export const aiLogsHandler = async (_req: Request, res: Response) => {
  const logs = await prisma.aiRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  });
  return res.json({ logs });
};
