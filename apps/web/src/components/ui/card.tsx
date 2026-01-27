import React from "react";
import { cn } from "../../utils/cn";

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children
}) => (
  <div
    className={cn(
      "rounded-2xl bg-white/80 p-4 shadow-card backdrop-blur dark:bg-slate-900/80",
      className
    )}
  >
    {children}
  </div>
);
