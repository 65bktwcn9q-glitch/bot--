import { useEffect, useMemo, useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import toast from "react-hot-toast";
import { useLauncherStore } from "../store/launcherStore";
import { ServerInfo } from "../types/server";

interface LauncherSettings {
  gta_path?: string;
  download_limit?: number;
  language?: string;
}

export default function Settings() {
  const { servers, loadServers, detectGtaPath, gtaPath } = useLauncherStore();
  const [settings, setSettings] = useState<LauncherSettings>({});
  const [selectedServer, setSelectedServer] = useState<string>("");

  useEffect(() => {
    void loadServers();
  }, [loadServers]);

  useEffect(() => {
    invoke<LauncherSettings>("get_settings")
      .then((data) => setSettings(data))
      .catch(() => setSettings({}));
  }, []);

  useEffect(() => {
    if (!gtaPath) {
      void detectGtaPath();
    }
  }, [gtaPath, detectGtaPath]);

  const handlePickFolder = async () => {
    const selected = await open({ directory: true });
    if (typeof selected === "string") {
      setSettings((prev) => ({ ...prev, gta_path: selected }));
      await invoke("set_gta_path", { path: selected });
      toast.success("GTA path saved");
    }
  };

  const handleSave = async () => {
    await invoke("update_settings", { settings });
    toast.success("Settings updated");
  };

  const handleVerify = async () => {
    const server = servers.find((item) => item.id === selectedServer);
    if (!server) {
      toast.error("Select a server first");
      return;
    }
    try {
      await invoke("verify_files", {
        serverId: server.id,
        baseUrl: server.updatesBaseUrl
      });
      toast.success("Integrity check completed");
    } catch (error) {
      toast.error(String(error));
    }
  };

  const currentPath = settings.gta_path ?? gtaPath;
  const serverOptions = useMemo(() => servers, [servers]);

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-2xl font-display font-semibold">Launcher settings</h2>
        <p className="text-sm text-text-muted mt-2">
          Configure GTA path, downloads, and localization.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 space-y-6">
          <div>
            <p className="text-xs text-text-muted">GTA San Andreas folder</p>
            <p className="text-sm mt-2">{currentPath ?? "Not detected"}</p>
            <div className="mt-3 flex gap-3">
              <button
                onClick={handlePickFolder}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm"
              >
                Choose folder
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-accent text-black text-sm font-semibold"
              >
                Save
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted" htmlFor="download-limit">
              Download limit (KB/s)
            </label>
            <input
              id="download-limit"
              type="number"
              value={settings.download_limit ?? ""}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  download_limit: Number(event.target.value)
                }))
              }
              className="mt-2 w-full rounded-xl bg-panel/70 border border-white/10 px-4 py-2 text-sm"
              placeholder="0 = unlimited"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted" htmlFor="language">
              Language
            </label>
            <select
              id="language"
              value={settings.language ?? "en"}
              onChange={(event) =>
                setSettings((prev) => ({ ...prev, language: event.target.value }))
              }
              className="mt-2 w-full rounded-xl bg-panel/70 border border-white/10 px-4 py-2 text-sm"
            >
              <option value="en">English</option>
              <option value="ru">Русский</option>
              <option value="ua">Українська</option>
            </select>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <h3 className="text-lg font-display font-semibold">Integrity tools</h3>
          <p className="text-sm text-text-muted">
            Verify local files against the server manifest and repair missing items.
          </p>
          <div>
            <label className="text-xs text-text-muted" htmlFor="server-select">
              Choose server
            </label>
            <select
              id="server-select"
              value={selectedServer}
              onChange={(event) => setSelectedServer(event.target.value)}
              className="mt-2 w-full rounded-xl bg-panel/70 border border-white/10 px-4 py-2 text-sm"
            >
              <option value="">Select server</option>
              {serverOptions.map((server: ServerInfo) => (
                <option key={server.id} value={server.id}>
                  {server.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleVerify}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm"
          >
            Verify integrity
          </button>
        </div>
      </div>
    </div>
  );
}
