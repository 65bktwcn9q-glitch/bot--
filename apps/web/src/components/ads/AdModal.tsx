import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { AdItem } from "./AdBanner";

export const AdModal: React.FC<{
  ad?: AdItem;
  onClose: () => void;
}> = ({ ad, onClose }) => (
  <AnimatePresence>
    {ad && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <p className="text-sm text-slate-400">Anzeige</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{ad.title}</h3>
          <p className="mt-2 text-sm text-slate-500">{ad.text}</p>
          {ad.imageUrl && (
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="mt-4 h-40 w-full rounded-2xl object-cover"
            />
          )}
          <div className="mt-6 flex flex-col gap-2">
            {ad.linkUrl && (
              <Button onClick={() => window.open(ad.linkUrl!, "_blank")}>
                Mehr erfahren
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Schließen
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
