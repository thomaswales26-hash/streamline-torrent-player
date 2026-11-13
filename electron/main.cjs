const { app, BrowserWindow, ipcMain, Menu, shell } = require("electron");
const path = require("node:path");

const isMac = process.platform === "darwin";
const fallbackTrackers = [
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://open.stealth.si:80/announce",
  "udp://tracker.torrent.eu.org:451/announce",
  "udp://tracker.moeking.me:6969/announce",
  "wss://tracker.openwebtorrent.com",
  "wss://tracker.btorrent.xyz",
];
let mainWindow;
let torrentClient;
let torrentServer;

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unit;
  return `${value >= 10 || unit === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`;
}

function formatDuration(milliseconds) {
  if (!Number.isFinite(milliseconds)) return "Calculating";
  if (milliseconds <= 0) return "Complete";
  const seconds = Math.ceil(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${remainder}s`;
  return `${remainder}s`;
}

function torrentState(torrent) {
  const video = torrent.files
    ?.filter((file) => /\.(mp4|m4v|mov|mkv|webm|avi)$/i.test(file.name))
    .sort((a, b) => b.length - a.length)[0];
  const serverAddress = torrentServer?.address();
  const streamUrl =
    video && serverAddress && typeof serverAddress !== "string"
      ? `http://127.0.0.1:${serverAddress.port}${video.streamURL}`
      : undefined;

  return {
    id: torrent.infoHash,
    title: torrent.name || torrent.infoHash,
    meta: video ? `${path.extname(video.name).slice(1).toUpperCase()} video • Streaming priority` : "Downloading metadata…",
    progress: torrent.progress * 100,
    size: formatBytes(torrent.length),
    downloaded: formatBytes(torrent.downloaded),
    speed: torrent.done ? "—" : `${formatBytes(torrent.downloadSpeed)}/s`,
    eta: formatDuration(torrent.timeRemaining),
    seeds: 0,
    peers: torrent.numPeers,
    status: torrent.done ? "complete" : torrent.paused ? "paused" : "downloading",
    color: "from-[#24373b] via-[#588e8b] to-[#12191b]",
    streamUrl,
  };
}

function publishTorrentStates() {
  if (!mainWindow || mainWindow.isDestroyed() || !torrentClient) return;
  mainWindow.webContents.send("torrent:updates", torrentClient.torrents.map(torrentState));
}

async function initializeTorrentEngine() {
  const { default: WebTorrent } = await import("webtorrent");
  torrentClient = new WebTorrent({
    maxConns: 200,
    downloadLimit: -1,
    uploadLimit: -1,
    tracker: { announce: fallbackTrackers },
    dht: true,
    lsd: true,
    utPex: true,
    natUpnp: true,
    natPmp: true,
    secure: 1,
  });

  torrentClient.on("error", (error) => {
    console.error("Torrent engine error:", error);
  });

  torrentServer = torrentClient.createServer({ hostname: "127.0.0.1" });
  torrentServer.listen(0, "127.0.0.1");

  ipcMain.handle("torrent:add", async (_event, source) => {
    if (!source) throw new Error("A magnet link or torrent file is required.");
    const torrentId = typeof source === "string" ? source : Buffer.from(source);

    return new Promise((resolve, reject) => {
      let settled = false;
      const torrent = torrentClient.add(
        torrentId,
        {
          path: path.join(app.getPath("downloads"), "Streamline"),
          destroyStoreOnDestroy: false,
        },
        (readyTorrent) => {
          const video = readyTorrent.files
            .filter((file) => /\.(mp4|m4v|mov|mkv|webm|avi)$/i.test(file.name))
            .sort((a, b) => b.length - a.length)[0];

          // Prioritize the primary video while still downloading every file.
          if (video) video.select(10);
          publishTorrentStates();
          settled = true;
          resolve(torrentState(readyTorrent));
        },
      );

      torrent.once("error", (error) => {
        if (!settled) reject(error);
      });
    });
  });

  ipcMain.handle("torrent:toggle", async (_event, infoHash) => {
    const torrent = await torrentClient.get(infoHash);
    if (!torrent) return false;
    if (torrent.paused) torrent.resume();
    else torrent.pause();
    publishTorrentStates();
    return true;
  });

  ipcMain.handle("torrent:show", async (_event, infoHash) => {
    const torrent = await torrentClient.get(infoHash);
    if (!torrent) return false;
    const firstFile = torrent.files?.[0];
    if (firstFile) {
      shell.showItemInFolder(path.join(torrent.path, firstFile.path));
    } else {
      await shell.openPath(torrent.path);
    }
    return true;
  });

  ipcMain.handle("torrent:list", () => torrentClient.torrents.map(torrentState));
  setInterval(publishTorrentStates, 1000).unref();
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1000,
    minHeight: 680,
    show: false,
    backgroundColor: "#d9d8d3",
    title: "Streamline",
    titleBarStyle: isMac ? "hiddenInset" : "default",
    trafficLightPosition: { x: 22, y: 22 },
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });
  mainWindow = window;

  window.loadFile(path.join(__dirname, "..", "dist", "index.html"));

  window.once("ready-to-show", () => {
    window.show();
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });

  window.webContents.on("will-navigate", (event, url) => {
    if (url !== window.webContents.getURL()) {
      event.preventDefault();
    }
  });
}

const menuTemplate = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []),
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      ...(isMac
        ? [{ role: "pasteAndMatchStyle" }, { role: "delete" }, { role: "selectAll" }]
        : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  {
    label: "Window",
    submenu: [{ role: "minimize" }, { role: "zoom" }, ...(isMac ? [{ type: "separator" }, { role: "front" }] : [{ role: "close" }])],
  },
];

app.whenReady().then(async () => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
  await initializeTorrentEngine();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});

app.on("before-quit", () => {
  torrentServer?.close();
  torrentClient?.destroy();
});
