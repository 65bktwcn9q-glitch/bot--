import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function TopBar() {
  const { t } = useTranslation();

  return (
    <div className="px-6 pt-6">
      <motion.div
        className="glass-panel rounded-2xl px-6 py-4 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div>
          <p className="text-sm text-text-muted">{t("app.kicker")}</p>
          <h1 className="text-2xl font-display font-semibold">{t("app.title")}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-panel/80 px-4 py-2 rounded-xl border border-white/10">
            <p className="text-xs text-text-muted">{t("app.build")}</p>
            <p className="text-sm font-semibold text-accent">v0.1</p>
          </div>
          <div className="bg-accent/10 text-accent px-4 py-2 rounded-xl border border-accent/40">
            <p className="text-xs uppercase tracking-[0.24em]">Premium</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
