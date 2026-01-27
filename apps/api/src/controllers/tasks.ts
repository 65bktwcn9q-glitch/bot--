import { Request, Response } from "express";
import { z } from "zod";
import { generateTask } from "../lib/deepseek.js";
import { prisma } from "../lib/prisma.js";
import { incrementDailyTask, isVipUser, resetDailyCounterIfNeeded } from "../services/userService.js";
import { TaskType } from "@prisma/client";
import { loadMonetizationConfig } from "../services/monetization.js";

const GenerateSchema = z.object({
  level: z.string(),
  goal: z.string(),
  taskType: z.enum([
    "multiple_choice",
    "fill_in_the_blank",
    "short_translation",
    "mini_dialog"
  ]),
  context: z.string().optional()
});

const SubmitSchema = z.object({
  taskType: z.enum([
    "MULTIPLE_CHOICE",
    "FILL_BLANK",
    "SHORT_TRANSLATION",
    "MINI_DIALOG"
  ]),
  success: z.boolean(),
  tags: z.array(z.string()).default([])
});

export const generateTaskHandler = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await resetDailyCounterIfNeeded(user.id);
  const refreshed = await prisma.user.findUnique({
    where: { id: user.id },
    include: { subscription: true }
  });
  if (!refreshed) {
    return res.status(404).json({ error: "User not found" });
  }

  const vip = isVipUser(refreshed);
  const monetization = await loadMonetizationConfig();
  if (!vip && refreshed.dailyTaskCount >= monetization.freeDailyLimit) {
    return res.status(402).json({
      error: "Daily limit reached",
      limit: monetization.freeDailyLimit
    });
  }

  const payload = GenerateSchema.parse(req.body);

  try {
    const task = await generateTask({
      level: payload.level,
      goal: payload.goal,
      taskType: payload.taskType,
      context: payload.context ?? ""
    });

    await prisma.aiRequest.create({
      data: {
        userId: user.id,
        taskType: mapTaskType(payload.taskType),
        prompt: JSON.stringify(payload),
        response: JSON.stringify(task),
        status: "success",
        cost: vip ? 0.002 : 0.001
      }
    });

    await incrementDailyTask(user.id);

    return res.json({
      task,
      vip,
      remaining: vip
        ? null
        : Math.max(0, monetization.freeDailyLimit - refreshed.dailyTaskCount - 1)
    });
  } catch (error) {
    await prisma.aiRequest.create({
      data: {
        userId: user.id,
        taskType: mapTaskType(payload.taskType),
        prompt: JSON.stringify(payload),
        response: String(error),
        status: "error",
        cost: 0
      }
    });
    return res.status(500).json({ error: "Failed to generate task" });
  }
};

export const submitAnswerHandler = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = SubmitSchema.parse(req.body);

  await prisma.taskLog.create({
    data: {
      userId: user.id,
      taskType: payload.taskType as TaskType,
      success: payload.success,
      tags: payload.tags.join(",")
    }
  });

  const pointsDelta = payload.success ? 10 : 2;
  await prisma.user.update({
    where: { id: user.id },
    data: { points: { increment: pointsDelta } }
  });

  return res.json({ ok: true, pointsDelta });
};

const mapTaskType = (taskType: string): TaskType => {
  switch (taskType) {
    case "multiple_choice":
      return TaskType.MULTIPLE_CHOICE;
    case "fill_in_the_blank":
      return TaskType.FILL_BLANK;
    case "short_translation":
      return TaskType.SHORT_TRANSLATION;
    case "mini_dialog":
      return TaskType.MINI_DIALOG;
    default:
      return TaskType.MULTIPLE_CHOICE;
  }
};
