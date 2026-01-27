import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { prisma } from "./prisma.js";
import { parseInitData, validateInitData } from "./telegram.js";

export const telegramAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const initData =
    req.headers["x-telegram-init-data"]?.toString() ??
    req.query.initData?.toString() ??
    "";

  if (!initData && config.devMode) {
    const user = await prisma.user.upsert({
      where: { telegramId: config.devUserTelegramId },
      update: {},
      create: {
        telegramId: config.devUserTelegramId,
        name: "Dev User",
        language: "ru"
      },
      include: { subscription: true }
    });
    req.user = user;
    return next();
  }

  if (!initData) {
    return res.status(401).json({ error: "Missing initData" });
  }

  const isValid = validateInitData(initData, config.telegramBotToken);
  if (!isValid && !config.devMode) {
    return res.status(401).json({ error: "Invalid initData" });
  }

  const parsed = parseInitData(initData);
  if (!parsed.user && !config.devMode) {
    return res.status(401).json({ error: "Missing user" });
  }

  if (!parsed.user && config.devMode) {
    parsed.user = { id: Number(config.devUserTelegramId), first_name: "Dev User" };
  }

  const telegramId = String(parsed.user.id);
  const user = await prisma.user.upsert({
    where: { telegramId },
    update: {
      name: parsed.user.first_name ?? undefined,
      language: parsed.user.language_code ?? undefined
    },
    create: {
      telegramId,
      name: parsed.user.first_name ?? undefined,
      language: parsed.user.language_code ?? "ru"
    },
    include: { subscription: true }
  });

  req.user = user;
  return next();
};

export const adminGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const isWhitelisted = config.adminIds.includes(req.user.telegramId);
  if (isWhitelisted) {
    await prisma.admin.upsert({
      where: { telegramId: req.user.telegramId },
      update: {},
      create: { telegramId: req.user.telegramId, role: "ADMIN" }
    });
    return next();
  }

  const admin = await prisma.admin.findUnique({
    where: { telegramId: req.user.telegramId }
  });
  if (!admin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  return next();
};
