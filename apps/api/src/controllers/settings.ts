import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const SettingsSchema = z.object({
  level: z.string().optional(),
  goal: z.string().optional(),
  language: z.string().optional()
});

export const updateSettingsHandler = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = SettingsSchema.parse(req.body);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      level: payload.level ?? undefined,
      goal: payload.goal ?? undefined,
      language: payload.language ?? undefined
    }
  });

  return res.json({ user: updated });
};

export const resetProgressHandler = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await prisma.taskLog.deleteMany({ where: { userId: user.id } });
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      streak: 0,
      points: 0,
      dailyTaskCount: 0,
      dailyTaskDate: new Date()
    }
  });

  return res.json({ user: updated });
};
