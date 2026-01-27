import React from "react";
import { motion } from "framer-motion";
import { Card } from "../ui/card";

export type AdItem = {
  id: string;
  type: "BANNER" | "FULLSCREEN";
  title: string;
  text: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
};

export const AdBanner: React.FC<{ ad: AdItem }> = ({ ad }) => (
  <motion.a
    href={ad.linkUrl || "#"}
    target="_blank"
    rel="noreferrer"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="block"
  >
    <Card className="flex items-center gap-3 border border-brand-100">
      {ad.imageUrl && (
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="h-12 w-12 rounded-xl object-cover"
        />
      )}
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {ad.title}
        </p>
        <p className="text-xs text-slate-500">{ad.text}</p>
      </div>
    </Card>
  </motion.a>
);
