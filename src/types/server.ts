export interface ServerInfo {
  id: string;
  name: string;
  description: string;
  ip: string;
  port: number;
  brandColor: string;
  backgroundImage?: string;
  updatesBaseUrl: string;
  discordUrl?: string;
  siteUrl?: string;
  tags: string[];
  rules?: string[];
}

export interface ServerStatus {
  online: boolean;
  ping: number | null;
  players: number;
  maxPlayers: number;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  url?: string;
}
