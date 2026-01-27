import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const activeAdsHandler = async (_req: Request, res: Response) => {
  const ads = await prisma.ad.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  });
  return res.json({ ads });
};
