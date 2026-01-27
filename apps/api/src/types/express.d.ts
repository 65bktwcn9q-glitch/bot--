import type { User, Subscription } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User & { subscription?: Subscription | null };
    }
  }
}

export {};
