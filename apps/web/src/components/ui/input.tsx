import React from "react";
import { cn } from "../../utils/cn";

export const Input: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { label?: string }
> = ({ label, className, ...props }) => (
  <label className="flex flex-col gap-1 text-sm text-slate-500">
    {label}
    <input
      className={cn(
        "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200",
        className
      )}
      {...props}
    />
  </label>
);
