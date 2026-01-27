import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { isVipUser } from "../services/userService.js";
import { loadMonetizationConfig } from "../services/monetization.js";

export const profileHandler = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const current = await prisma.user.findUnique({
    where: { id: user.id },
    include: { subscription: true }
  });

  if (!current) {
    return res.status(404).json({ error: "User not found" });
  }

  const vip = isVipUser(current);

  const monetization = await loadMonetizationConfig();

  return res.json({
    user: current,
    vip,
    monetization
  });
};
