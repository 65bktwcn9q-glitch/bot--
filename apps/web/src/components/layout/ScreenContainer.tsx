import React from "react";
import { cn } from "../../utils/cn";

export const ScreenContainer: React.FC<{
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, children, className }) => (
  <div className={cn("flex min-h-screen flex-col gap-6 px-4 pb-20 pt-8", className)}>
    {(title || subtitle) && (
      <div>
        {title && <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>}
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);
