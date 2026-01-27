import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const historyHandler = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const logs = await prisma.taskLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  const total = await prisma.taskLog.count({ where: { userId: user.id } });
  const correct = await prisma.taskLog.count({
    where: { userId: user.id, success: true }
  });

  const tags = logs
    .flatMap((log) => log.tags.split(",").filter(Boolean))
    .reduce<Record<string, number>>((acc, tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1;
      return acc;
    }, {});

  return res.json({
    logs,
    stats: {
      total,
      accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
      weakTopics: Object.entries(tags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag)
    }
  });
};
