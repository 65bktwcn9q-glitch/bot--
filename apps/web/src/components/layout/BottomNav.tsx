import React from "react";
import { NavLink } from "react-router-dom";
import { Home, BookOpen, History, Settings } from "lucide-react";
import { cn } from "../../utils/cn";

const links = [
  { to: "/", label: "Start", icon: Home },
  { to: "/training", label: "Training", icon: BookOpen },
  { to: "/history", label: "Historie", icon: History },
  { to: "/settings", label: "Einstellungen", icon: Settings }
];

export const BottomNav: React.FC = () => (
  <nav className="fixed bottom-4 left-0 right-0 mx-auto w-[90%] rounded-2xl bg-white/90 p-2 shadow-card backdrop-blur dark:bg-slate-900/90">
    <div className="flex items-center justify-between">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs text-slate-500",
              isActive && "bg-brand-100 text-brand-700"
            )
          }
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </NavLink>
      ))}
    </div>
  </nav>
);
