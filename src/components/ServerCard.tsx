import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ServerInfo, ServerStatus } from "../types/server";

interface ServerCardProps {
  server: ServerInfo;
  status?: ServerStatus;
}

export default function ServerCard({ server, status }: ServerCardProps) {
  return (
    <Link to={`/servers/${server.id}`} className="block h-full">
      <motion.div
        whileHover={{ y: -6, boxShadow: "0 30px 80px -45px rgba(0,0,0,0.9)" }}
        className="glass-panel rounded-2xl overflow-hidden h-full flex flex-col"
      >
        <div className="relative h-40">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${server.backgroundImage ?? "/server-bg.svg"})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          />
          <div
            className="absolute inset-0 opacity-70"
            style={{ background: `linear-gradient(120deg, ${server.brandColor}, transparent)` }}
          />
          <div className="relative p-4 flex flex-col h-full justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-text-muted">{server.tags.join(" · ")}</p>
              <h3 className="text-lg font-display font-semibold mt-2">{server.name}</h3>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2 py-1 rounded-full border ${
                  status?.online
                    ? "border-success/40 text-success"
                    : "border-danger/40 text-danger"
                }`}
              >
                {status?.online ? "Online" : "Offline"}
              </span>
              <span className="text-xs text-text-muted">
                {status?.players ?? 0}/{status?.maxPlayers ?? 0} players
              </span>
            </div>
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col gap-3">
          <p className="text-sm text-text-muted line-clamp-2">{server.description}</p>
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>{server.ip}:{server.port}</span>
            <span>{status?.ping ?? "--"} ms</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
