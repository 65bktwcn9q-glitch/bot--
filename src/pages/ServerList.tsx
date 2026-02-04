import { useEffect } from "react";
import { motion } from "framer-motion";
import ServerCard from "../components/ServerCard";
import { useLauncherStore } from "../store/launcherStore";

export default function ServerList() {
  const { servers, statuses, loadServers, fetchStatus } = useLauncherStore();

  useEffect(() => {
    void loadServers();
  }, [loadServers]);

  useEffect(() => {
    servers.forEach((server) => void fetchStatus(server));
    const interval = setInterval(() => {
      servers.forEach((server) => void fetchStatus(server));
    }, 15000);
    return () => clearInterval(interval);
  }, [servers, fetchStatus]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-text-muted">Server showcase</p>
          <h2 className="text-2xl font-display font-semibold">Choose your story</h2>
        </div>
        <motion.div
          className="hidden md:block text-xs text-text-muted"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Updated every 15 seconds
        </motion.div>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {servers.map((server) => (
          <ServerCard
            key={server.id}
            server={server}
            status={statuses[server.id]}
          />
        ))}
      </div>
    </div>
  );
}
