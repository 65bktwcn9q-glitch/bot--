import React from "react";
import { cn } from "../../utils/cn";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "primary",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-60";
  const variants: Record<string, string> = {
    primary: "bg-brand-500 text-white hover:bg-brand-600",
    secondary: "bg-white/70 text-slate-900 shadow-card hover:bg-white",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
};
