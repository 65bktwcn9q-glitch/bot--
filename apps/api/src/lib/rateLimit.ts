import rateLimit from "express-rate-limit";
import { config } from "../config.js";
import { isVipUser } from "../services/userService.js";
import { RequestHandler } from "express";

const baseLimiter = (max: number) =>
  rateLimit({
    windowMs: 60 * 1000,
    max,
    keyGenerator: (req) => req.user?.id ?? req.ip,
    standardHeaders: true,
    legacyHeaders: false
  });

export const dynamicRateLimiter: RequestHandler = (req, res, next) => {
  const user = req.user;
  if (!user) {
    return baseLimiter(config.freeRateLimit)(req, res, next);
  }
  const vip = isVipUser({ ...user, subscription: user.subscription ?? null });
  const limiter = baseLimiter(vip ? config.vipRateLimit : config.freeRateLimit);
  return limiter(req, res, next);
};
