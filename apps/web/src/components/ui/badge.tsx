import React from "react";
import { cn } from "../../utils/cn";

export const Badge: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-600",
      className
    )}
  >
    {children}
  </span>
);
