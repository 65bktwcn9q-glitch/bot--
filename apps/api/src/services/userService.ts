import { prisma } from "../lib/prisma.js";
import { SubscriptionPlan, SubscriptionStatus, User } from "@prisma/client";

export const isVipUser = (user: User & { subscription?: { plan: SubscriptionPlan; status: SubscriptionStatus; expiresAt: Date | null } | null; }) => {
  const sub = user.subscription;
  if (!sub) return false;
  if (sub.status !== SubscriptionStatus.ACTIVE) return false;
  if (sub.plan === SubscriptionPlan.LIFETIME) return true;
  if (!sub.expiresAt) return false;
  return sub.expiresAt.getTime() > Date.now();
};

export const resetDailyCounterIfNeeded = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  const today = new Date();
  const last = user.dailyTaskDate;
  if (!last || last.toDateString() !== today.toDateString()) {
    return prisma.user.update({
      where: { id: userId },
      data: { dailyTaskCount: 0, dailyTaskDate: today }
    });
  }
  return user;
};

export const incrementDailyTask = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { dailyTaskCount: { increment: 1 } }
  });
};
