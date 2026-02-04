import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { invoke } from "@tauri-apps/api/tauri";
import UpdateModal from "../components/UpdateModal";
import { useLauncherStore } from "../store/launcherStore";
import { NewsItem } from "../types/server";

export default function ServerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { servers, statuses, loadServers, fetchStatus, update, startUpdate, closeUpdate } =
    useLauncherStore();
  const [news, setNews] = useState<NewsItem[]>([]);
  const server = useMemo(() => servers.find((item) => item.id === id), [servers, id]);

  useEffect(() => {
    if (!servers.length) {
      void loadServers();
    }
  }, [servers.length, loadServers]);

  useEffect(() => {
    if (!server) return;
    void fetchStatus(server);
    const interval = setInterval(() => void fetchStatus(server), 15000);
    return () => clearInterval(interval);
  }, [server, fetchStatus]);

  useEffect(() => {
    if (!server) return;
    fetch(`${server.updatesBaseUrl}/news.json`)
      .then((response) => response.json())
      .then((data) => setNews(data))
      .catch(() => setNews([]));
  }, [server]);

  if (!server) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <p className="text-text-muted">Server not found.</p>
        <button
          className="mt-4 text-accent text-sm"
          onClick={() => navigate("/")}
        >
          Back to servers
        </button>
      </div>
    );
  }

  const status = statuses[server.id];

  const handlePlay = async () => {
    try {
      await startUpdate(server);
      await invoke("launch_game", { ip: server.ip, port: server.port });
      toast.success("Launching GTA San Andreas...");
    } catch (error) {
      toast.error(String(error));
    }
  };

  return (
    <div className="space-y-6">
      <UpdateModal state={update} onClose={closeUpdate} />
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="relative h-56">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.75)), url(${server.backgroundImage ?? "/server-bg.svg"})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          />
          <div
            className="absolute inset-0 opacity-70"
            style={{ background: `linear-gradient(120deg, ${server.brandColor}, transparent)` }}
          />
          <div className="relative p-6 flex h-full items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-text-muted">{server.tags.join(" · ")}</p>
              <h2 className="text-3xl font-display font-semibold mt-2">{server.name}</h2>
              <p className="text-sm text-text-muted mt-2 max-w-2xl">{server.description}</p>
            </div>
          </div>
        </div>
        <div className="p-6 grid lg:grid-cols-[1.3fr_1fr] gap-6">
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted">Status</p>
                  <p className={`text-lg font-semibold ${status?.online ? "text-success" : "text-danger"}`}>
                    {status?.online ? "Online" : "Offline"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Players</p>
                  <p className="text-lg font-semibold">
                    {status?.players ?? 0}/{status?.maxPlayers ?? 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Ping</p>
                  <p className="text-lg font-semibold">{status?.ping ?? "--"} ms</p>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 border border-white/10">
              <h3 className="font-display text-lg font-semibold">Rules</h3>
              <ul className="mt-3 space-y-2 text-sm text-text-muted list-disc list-inside">
                {(server.rules ?? [
                  "Respect other players and keep RP friendly.",
                  "No cheating, hacks, or third-party mods.",
                  "Listen to moderators and follow server events."
                ]).map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              {server.discordUrl && (
                <a
                  href={server.discordUrl}
                  className="px-4 py-2 rounded-xl bg-accent/15 border border-accent/40 text-accent text-sm"
                >
                  Discord
                </a>
              )}
              {server.siteUrl && (
                <a
                  href={server.siteUrl}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-text-primary text-sm"
                >
                  Website
                </a>
              )}
              <button
                onClick={handlePlay}
                className="px-5 py-2 rounded-xl bg-accent text-black font-semibold text-sm shadow-glow"
              >
                Play
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="glass-panel rounded-2xl p-5 border border-white/10">
              <h3 className="font-display text-lg font-semibold">Server News</h3>
              <div className="mt-4 space-y-3">
                {news.length === 0 && (
                  <p className="text-sm text-text-muted">No news yet.</p>
                )}
                {news.map((item) => (
                  <motion.div
                    key={item.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>{item.date}</span>
                      {item.url && (
                        <a className="text-accent" href={item.url}>
                          Open
                        </a>
                      )}
                    </div>
                    <h4 className="mt-2 font-semibold">{item.title}</h4>
                    <p className="text-sm text-text-muted mt-1">{item.summary}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-5 border border-white/10">
              <p className="text-xs text-text-muted">Connection</p>
              <p className="text-sm mt-2">
                {server.ip}:{server.port}
              </p>
              <p className="text-xs text-text-muted mt-2">Auto update enabled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
