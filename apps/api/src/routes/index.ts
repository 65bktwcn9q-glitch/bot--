import { Router } from "express";
import { telegramAuth, adminGuard } from "../lib/auth.js";
import { generateTaskHandler, submitAnswerHandler } from "../controllers/tasks.js";
import { profileHandler } from "../controllers/profile.js";
import { historyHandler } from "../controllers/history.js";
import { updateSettingsHandler, resetProgressHandler } from "../controllers/settings.js";
import { activeAdsHandler } from "../controllers/ads.js";
import {
  aiLogsHandler,
  createAdHandler,
  deleteAdHandler,
  listAdsHandler,
  listUsersHandler,
  setVipHandler,
  updateAdHandler,
  updateMonetizationHandler,
  revokeVipHandler
} from "../controllers/admin.js";
import { createPaymentHandler, webhookHandler } from "../controllers/payments.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.json({ ok: true }));
apiRouter.post("/webhooks/:provider", webhookHandler);

apiRouter.use(telegramAuth);

apiRouter.get("/profile", profileHandler);
apiRouter.post("/generateTask", generateTaskHandler);
apiRouter.post("/submitAnswer", submitAnswerHandler);
apiRouter.get("/history", historyHandler);
apiRouter.put("/settings", updateSettingsHandler);
apiRouter.post("/settings/reset", resetProgressHandler);
apiRouter.get("/ads", activeAdsHandler);
apiRouter.post("/payments/create", createPaymentHandler);

apiRouter.use("/admin", adminGuard);
apiRouter.get("/admin/users", listUsersHandler);
apiRouter.post("/admin/vip", setVipHandler);
apiRouter.post("/admin/vip/revoke", revokeVipHandler);
apiRouter.get("/admin/ads", listAdsHandler);
apiRouter.post("/admin/ads", createAdHandler);
apiRouter.put("/admin/ads/:id", updateAdHandler);
apiRouter.delete("/admin/ads/:id", deleteAdHandler);
apiRouter.post("/admin/monetization", updateMonetizationHandler);
apiRouter.get("/admin/ai-logs", aiLogsHandler);
