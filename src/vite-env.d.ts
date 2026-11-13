/// <reference types="vite/client" />

type NativeTorrent = {
  id: string;
  title: string;
  meta: string;
  progress: number;
  size: string;
  downloaded: string;
  speed: string;
  eta: string;
  seeds: number;
  peers: number;
  status: "downloading" | "paused" | "complete";
  color: string;
  streamUrl?: string;
};

interface Window {
  streamline?: {
    addTorrent(source: string | Uint8Array): Promise<NativeTorrent>;
    toggleTorrent(infoHash: string): Promise<boolean>;
    showTorrent(infoHash: string): Promise<boolean>;
    listTorrents(): Promise<NativeTorrent[]>;
    engineStatus(): Promise<{ ready: boolean; error: string | null }>;
    onTorrentUpdates(callback: (torrents: NativeTorrent[]) => void): () => void;
  };
}
