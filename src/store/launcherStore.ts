import { create } from "zustand";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { ServerInfo, ServerStatus } from "../types/server";

export interface UpdateState {
  active: boolean;
  title: string;
  progress: number;
  currentFile: string;
  speed: string;
  eta: string;
  required: boolean;
  error?: string;
}

interface LauncherState {
  servers: ServerInfo[];
  statuses: Record<string, ServerStatus>;
  gtaPath?: string;
  update: UpdateState;
  loadServers: () => Promise<void>;
  fetchStatus: (server: ServerInfo) => Promise<void>;
  detectGtaPath: () => Promise<void>;
  setGtaPath: (path: string) => Promise<void>;
  startUpdate: (server: ServerInfo) => Promise<void>;
  closeUpdate: () => void;
}

const defaultUpdate: UpdateState = {
  active: false,
  title: "",
  progress: 0,
  currentFile: "",
  speed: "",
  eta: "",
  required: false
};

export const useLauncherStore = create<LauncherState>((set, get) => ({
  servers: [],
  statuses: {},
  gtaPath: undefined,
  update: defaultUpdate,
  loadServers: async () => {
    const response = await fetch("/servers.json");
    const data = (await response.json()) as ServerInfo[];
    set({ servers: data });
  },
  fetchStatus: async (server) => {
    try {
      const status = (await invoke("fetch_server_status", {
        ip: server.ip,
        port: server.port
      })) as ServerStatus;
      set((state) => ({ statuses: { ...state.statuses, [server.id]: status } }));
    } catch {
      set((state) => ({
        statuses: {
          ...state.statuses,
          [server.id]: { online: false, ping: null, players: 0, maxPlayers: 0 }
        }
      }));
    }
  },
  detectGtaPath: async () => {
    const path = (await invoke("detect_gta_path")) as string | null;
    set({ gtaPath: path ?? undefined });
  },
  setGtaPath: async (path) => {
    await invoke("set_gta_path", { path });
    set({ gtaPath: path });
  },
  startUpdate: async (server) => {
    if (!get().update.active) {
      set({ update: { ...defaultUpdate, active: true, title: server.name } });
    }

    const unlisten = await listen("update-progress", (event) => {
      const payload = event.payload as UpdateState;
      set({ update: payload });
    });

    try {
      await invoke("update_server", {
        serverId: server.id,
        baseUrl: server.updatesBaseUrl
      });
    } catch (error) {
      set((state) => ({
        update: {
          ...state.update,
          error: String(error),
          required: false
        }
      }));
    } finally {
      await unlisten();
    }
  },
  closeUpdate: () => set({ update: defaultUpdate })
}));
