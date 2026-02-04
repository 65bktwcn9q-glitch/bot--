import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

const navItems = [
  { to: "/", labelKey: "nav.servers" },
  { to: "/settings", labelKey: "nav.settings" }
];

export default function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="hidden lg:flex flex-col gap-3 w-56 shrink-0">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            clsx(
              "glass-panel rounded-xl px-4 py-3 text-sm font-semibold transition",
              isActive
                ? "border-accent/50 text-accent shadow-glow"
                : "text-text-muted hover:text-text-primary hover:border-white/30"
            )
          }
        >
          {t(item.labelKey)}
        </NavLink>
      ))}
      <div className="mt-6 p-4 rounded-xl bg-panel/60 border border-white/5">
        <p className="text-xs text-text-muted">{t("sidebar.tipTitle")}</p>
        <p className="text-sm font-medium mt-2">{t("sidebar.tipBody")}</p>
      </div>
    </aside>
  );
}
