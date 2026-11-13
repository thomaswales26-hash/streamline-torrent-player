const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("streamline", {
  addTorrent: (source) => ipcRenderer.invoke("torrent:add", source),
  toggleTorrent: (infoHash) => ipcRenderer.invoke("torrent:toggle", infoHash),
  showTorrent: (infoHash) => ipcRenderer.invoke("torrent:show", infoHash),
  listTorrents: () => ipcRenderer.invoke("torrent:list"),
  onTorrentUpdates: (callback) => {
    const listener = (_event, torrents) => callback(torrents);
    ipcRenderer.on("torrent:updates", listener);
    return () => ipcRenderer.removeListener("torrent:updates", listener);
  },
});
