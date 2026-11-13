import { useEffect, useRef, useState, type ReactNode } from "react";

type Torrent = {
  id: number;
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
};

const initialTorrents: Torrent[] = [
  {
    id: 1,
    title: "Big Buck Bunny",
    meta: "2160p • H.264 • Stereo",
    progress: 68,
    size: "3.42 GB",
    downloaded: "2.33 GB",
    speed: "8.4 MB/s",
    eta: "2m 11s",
    seeds: 128,
    peers: 14,
    status: "downloading",
    color: "from-[#80674f] via-[#d6a875] to-[#28331f]",
  },
  {
    id: 2,
    title: "Tears of Steel",
    meta: "1080p • H.265 • 5.1",
    progress: 31,
    size: "1.86 GB",
    downloaded: "590 MB",
    speed: "3.7 MB/s",
    eta: "5m 34s",
    seeds: 74,
    peers: 9,
    status: "downloading",
    color: "from-[#263647] via-[#5e7284] to-[#1c1d25]",
  },
  {
    id: 3,
    title: "Sintel",
    meta: "1080p • H.264 • Stereo",
    progress: 100,
    size: "1.21 GB",
    downloaded: "1.21 GB",
    speed: "—",
    eta: "Complete",
    seeds: 91,
    peers: 0,
    status: "complete",
    color: "from-[#422d2a] via-[#bb6952] to-[#282733]",
  },
];

function Icon({
  children,
  size = 18,
  className = "",
}: {
  children: ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const icons = {
  download: <Icon><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M5 20h14" /></Icon>,
  clock: <Icon><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></Icon>,
  check: <Icon><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12 2.2 2.2 4.8-5" /></Icon>,
  compass: <Icon><circle cx="12" cy="12" r="8.5" /><path d="m15 9-2 4-4 2 2-4 4-2Z" /></Icon>,
  settings: <Icon><circle cx="12" cy="12" r="3" /><path d="M19 14.5l1.2 1-.9 1.6-1.6-.5a7 7 0 0 1-2 1.2l-.3 1.7h-1.8l-.4-1.7a7 7 0 0 1-2.3 0l-.4 1.7H8.7l-.3-1.7a7 7 0 0 1-2-1.2l-1.6.5-.9-1.6 1.2-1a7 7 0 0 1 0-2.8l-1.2-1 .9-1.6 1.6.5a7 7 0 0 1 2-1.2l.3-1.7h1.8l.4 1.7a7 7 0 0 1 2.3 0l.4-1.7h1.8l.3 1.7a7 7 0 0 1 2 1.2l1.6-.5.9 1.6-1.2 1a7 7 0 0 1 0 2.8Z" /></Icon>,
  search: <Icon><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 4 4" /></Icon>,
  plus: <Icon><path d="M12 5v14M5 12h14" /></Icon>,
  play: <Icon size={22}><path d="m9 6 9 6-9 6Z" fill="currentColor" stroke="none" /></Icon>,
  pause: <Icon size={22}><path d="M9 7v10M15 7v10" strokeWidth="2.5" /></Icon>,
  more: <Icon><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></Icon>,
  cast: <Icon><path d="M5 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="currentColor" /><path d="M4 12a6 6 0 0 1 6 6M4 8a10 10 0 0 1 10 10M12 5h6a2 2 0 0 1 2 2v9" /></Icon>,
  volume: <Icon><path d="M5 10v4h3l4 3V7l-4 3H5Z" /><path d="M15 9.5a4 4 0 0 1 0 5M17.5 7a7.5 7.5 0 0 1 0 10" /></Icon>,
  full: <Icon><path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4" /></Icon>,
  chevron: <Icon size={14}><path d="m9 7 5 5-5 5" /></Icon>,
  close: <Icon><path d="m7 7 10 10M17 7 7 17" /></Icon>,
  link: <Icon><path d="M9 15 7.5 16.5a3 3 0 0 1-4-4L7 9a3 3 0 0 1 4 0M15 9l1.5-1.5a3 3 0 0 1 4 4L17 15a3 3 0 0 1-4 0M8 12h8" /></Icon>,
};

function Poster({ torrent, large = false }: { torrent: Torrent; large?: boolean }) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-gradient-to-br ${torrent.color} ${
        large ? "h-full w-full" : "h-14 w-[86px] rounded-lg"
      }`}
    >
      <div className="absolute inset-0 opacity-35 [background:radial-gradient(circle_at_65%_32%,white,transparent_18%),linear-gradient(140deg,transparent_40%,#000_100%)]" />
      {!large && <div className="absolute bottom-2 left-2 h-2 w-8 rounded-full bg-white/25" />}
    </div>
  );
}

export default function App() {
  const [torrents, setTorrents] = useState(initialTorrents);
  const [selectedId, setSelectedId] = useState(1);
  const [activeNav, setActiveNav] = useState("All Torrents");
  const [query, setQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [playerOpen, setPlayerOpen] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [magnet, setMagnet] = useState("");
  const [torrentFile, setTorrentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selected = torrents.find((torrent) => torrent.id === selectedId) ?? torrents[0];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTorrents((current) =>
        current.map((torrent) =>
          torrent.status === "downloading" && torrent.progress < 99
            ? { ...torrent, progress: Math.min(99, torrent.progress + 0.02) }
            : torrent,
        ),
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const visibleTorrents = torrents.filter((torrent) => {
    const matchesSearch = torrent.title.toLowerCase().includes(query.toLowerCase());
    const matchesNav =
      activeNav === "All Torrents" ||
      (activeNav === "Downloading" && torrent.status === "downloading") ||
      (activeNav === "Completed" && torrent.status === "complete");
    return matchesSearch && matchesNav;
  });

  function toggleTorrent(id: number) {
    setTorrents((current) =>
      current.map((torrent) =>
        torrent.id === id && torrent.status !== "complete"
          ? { ...torrent, status: torrent.status === "paused" ? "downloading" : "paused" }
          : torrent,
      ),
    );
  }

  function addTorrent() {
    if (!magnet.trim() && !torrentFile) return;
    const newTorrent: Torrent = {
      id: Date.now(),
      title: torrentFile ? torrentFile.name.replace(/\.torrent$/i, "") : "New video download",
      meta: "Analyzing metadata…",
      progress: 2,
      size: "2.14 GB",
      downloaded: "43 MB",
      speed: "1.2 MB/s",
      eta: "Calculating",
      seeds: 18,
      peers: 4,
      status: "downloading",
      color: "from-[#24373b] via-[#588e8b] to-[#12191b]",
    };
    setTorrents((current) => [newTorrent, ...current]);
    setSelectedId(newTorrent.id);
    setMagnet("");
    setTorrentFile(null);
    setShowAdd(false);
  }

  function closeAddDialog() {
    setShowAdd(false);
    setMagnet("");
    setTorrentFile(null);
  }

  const navItems = [
    ["All Torrents", icons.compass, torrents.length],
    ["Downloading", icons.download, torrents.filter((item) => item.status === "downloading").length],
    ["Completed", icons.check, torrents.filter((item) => item.status === "complete").length],
  ] as const;

  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-7">
      <section className="app-shell flex h-[min(880px,calc(100vh-32px))] min-h-[620px] w-full max-w-[1440px] overflow-hidden">
        <aside className="flex w-[218px] shrink-0 flex-col border-r border-black/5 bg-[#f2f1ed]/90 px-3 pb-4 backdrop-blur-2xl">
          <div className="drag-region flex h-[66px] items-center gap-2 px-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="mb-5 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e95f34] text-white shadow-sm">
              {icons.download}
            </div>
            <div>
              <div className="text-[15px] font-semibold tracking-[-0.02em] text-[#20201e]">Streamline</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.13em] text-[#98958e]">Torrent Player</div>
            </div>
          </div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#aaa69e]">Library</p>
          <nav className="space-y-1">
            {navItems.map(([label, icon, count]) => (
              <button
                key={label}
                onClick={() => setActiveNav(label)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition ${
                  activeNav === label ? "bg-white text-[#292926] shadow-sm" : "text-[#77736c] hover:bg-white/50"
                }`}
              >
                <span className={activeNav === label ? "text-[#e95f34]" : "text-[#99958e]"}>{icon}</span>
                <span className="flex-1">{label}</span>
                <span className="text-[11px] text-[#aaa69e]">{count}</span>
              </button>
            ))}
          </nav>
          <p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#aaa69e]">Discover</p>
          <button className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[#77736c] hover:bg-white/50">
            <span className="text-[#99958e]">{icons.clock}</span>
            Watch history
          </button>
          <div className="mt-auto">
            <div className="mx-2 mb-4 rounded-xl border border-black/5 bg-white/60 p-3">
              <div className="mb-2 flex items-center justify-between text-[11px]">
                <span className="font-medium text-[#67635d]">Disk space</span>
                <span className="text-[#99958e]">74 GB free</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#dedbd4]">
                <div className="h-full w-[62%] rounded-full bg-[#e95f34]" />
              </div>
            </div>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[#77736c] hover:bg-white/50">
              <span className="text-[#99958e]">{icons.settings}</span>
              Settings
            </button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-[#faf9f6]">
          <header className="flex h-[67px] shrink-0 items-center gap-4 border-b border-[#ebe9e3] px-6">
            <div>
              <h1 className="text-[18px] font-semibold tracking-[-0.025em] text-[#262522]">{activeNav}</h1>
              <p className="text-[11px] text-[#99958e]">Your media, ready when you are</p>
            </div>
            <div className="relative ml-auto">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa69e]">{icons.search}</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search library"
                className="h-9 w-48 rounded-lg border border-[#e6e3dc] bg-white pl-10 pr-3 text-[12px] text-[#3c3a36] outline-none transition focus:w-56 focus:border-[#d7a38f]"
              />
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-[#252522] px-3.5 text-[12px] font-medium text-white shadow-sm transition hover:bg-[#3a3935]"
            >
              {icons.plus}
              Add torrent
            </button>
          </header>

          <div className="grid min-h-0 flex-1 grid-cols-[minmax(420px,0.94fr)_minmax(420px,1.2fr)]">
            <section className="min-w-0 overflow-y-auto border-r border-[#ebe9e3] px-5 py-5">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9c9891]">
                  {visibleTorrents.length} items
                </span>
                <button className="text-[#aaa69e] hover:text-[#56534e]">{icons.more}</button>
              </div>
              <div className="space-y-2.5">
                {visibleTorrents.map((torrent) => (
                  <button
                    key={torrent.id}
                    onClick={() => setSelectedId(torrent.id)}
                    className={`group w-full rounded-xl border p-3 text-left transition ${
                      selectedId === torrent.id
                        ? "border-[#e5d1c7] bg-[#fffaf7] shadow-[0_4px_18px_rgba(73,53,42,.06)]"
                        : "border-[#ebe9e3] bg-white hover:border-[#ddd9d0]"
                    }`}
                  >
                    <div className="flex gap-3">
                      <Poster torrent={torrent} />
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-[13px] font-semibold text-[#302f2c]">{torrent.title}</h3>
                            <p className="mt-0.5 truncate text-[10px] text-[#9a9690]">{torrent.meta}</p>
                          </div>
                          <span
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleTorrent(torrent.id);
                            }}
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                              selectedId === torrent.id
                                ? "bg-[#f0e5df] text-[#d8562e]"
                                : "bg-[#f3f1ed] text-[#817d76] opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            {torrent.status === "downloading" ? icons.pause : icons.play}
                          </span>
                        </div>
                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#e9e6df]">
                          <div
                            className={`h-full rounded-full ${torrent.status === "complete" ? "bg-[#6e9e77]" : "bg-[#e95f34]"}`}
                            style={{ width: `${torrent.progress}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center text-[10px] text-[#9a9690]">
                          <span className="font-semibold text-[#65615b]">{Math.floor(torrent.progress)}%</span>
                          <span className="mx-1.5 text-[#d0cdc6]">•</span>
                          <span>{torrent.downloaded} of {torrent.size}</span>
                          <span className="ml-auto">{torrent.status === "paused" ? "Paused" : torrent.eta}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="flex min-w-0 flex-col overflow-y-auto bg-white">
              <div className="p-5 pb-0">
                <div className="player group relative aspect-video overflow-hidden rounded-2xl bg-[#121613] shadow-[0_14px_40px_rgba(20,19,17,.16)]">
                  <Poster torrent={selected} large />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/20" />
                  <div className="absolute left-0 right-0 top-0 flex items-center p-4 text-white">
                    <div className="rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-medium backdrop-blur-md">
                      PLAYING WHILE DOWNLOADING
                    </div>
                    <button className="ml-auto opacity-80 hover:opacity-100">{icons.cast}</button>
                  </div>
                  {!isPlaying && (
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 pl-1 text-[#2d2b27] shadow-xl backdrop-blur"
                    >
                      {icons.play}
                    </button>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 text-white">
                    <div className="mb-3 h-1 cursor-pointer overflow-hidden rounded-full bg-white/25">
                      <div className="relative h-full w-[26%] rounded-full bg-[#eb6840]">
                        <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setIsPlaying((value) => !value)}>{isPlaying ? icons.pause : icons.play}</button>
                      <button className="opacity-90">{icons.volume}</button>
                      <span className="text-[10px] font-medium">18:42 / 1:12:08</span>
                      <span className="ml-auto text-[10px] text-white/75">1080p</span>
                      <button>{icons.full}</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-5">
                <div className="flex items-start">
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.11em] text-[#e15b34]">Now playing</p>
                    <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[#2d2b28]">{selected.title}</h2>
                    <p className="mt-1 text-[11px] text-[#99958e]">{selected.meta} • {selected.size}</p>
                  </div>
                  <button
                    onClick={() => setPlayerOpen((value) => !value)}
                    className="ml-auto mt-2 flex h-8 w-8 items-center justify-center rounded-lg border border-[#ebe8e2] text-[#88847d] hover:bg-[#f7f5f1]"
                  >
                    <span className={`transition ${playerOpen ? "rotate-90" : ""}`}>{icons.chevron}</span>
                  </button>
                </div>

                {playerOpen && (
                  <>
                    <div className="my-5 grid grid-cols-3 divide-x divide-[#ebe8e2] rounded-xl border border-[#ebe8e2] bg-[#faf9f6] py-3">
                      <div className="px-4">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#aaa69e]">Download</p>
                        <p className="mt-1 text-[13px] font-semibold text-[#3e3b36]">{selected.speed}</p>
                      </div>
                      <div className="px-4">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#aaa69e]">Seeds</p>
                        <p className="mt-1 text-[13px] font-semibold text-[#3e3b36]">{selected.seeds}</p>
                      </div>
                      <div className="px-4">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#aaa69e]">Peers</p>
                        <p className="mt-1 text-[13px] font-semibold text-[#3e3b36]">{selected.peers}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTorrent(selected.id)}
                        className="flex h-9 items-center gap-2 rounded-lg border border-[#e5e1da] px-3.5 text-[11px] font-medium text-[#5e5a54] hover:bg-[#f7f5f1]"
                      >
                        {selected.status === "downloading" ? icons.pause : icons.play}
                        {selected.status === "downloading" ? "Pause download" : "Resume download"}
                      </button>
                      <button className="flex h-9 items-center gap-2 rounded-lg border border-[#e5e1da] px-3.5 text-[11px] font-medium text-[#5e5a54] hover:bg-[#f7f5f1]">
                        Show in Finder
                      </button>
                      <button className="ml-auto text-[#aaa69e] hover:text-[#55514b]">{icons.more}</button>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </section>
      </section>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b1a18]/35 p-5 backdrop-blur-sm">
          <div className="w-full max-w-[460px] rounded-2xl border border-white/40 bg-[#fbfaf7] p-5 shadow-2xl">
            <div className="flex items-center">
              <div>
                <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#2d2b28]">Add a torrent</h2>
                <p className="mt-1 text-[11px] text-[#96928a]">Paste a magnet link to begin downloading.</p>
              </div>
              <button
                onClick={closeAddDialog}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#efede8] text-[#77736c]"
              >
                {icons.close}
              </button>
            </div>
            <div className="relative mt-5">
              <span className="absolute left-3 top-3 text-[#aaa69e]">{icons.link}</span>
              <textarea
                autoFocus
                value={magnet}
                onChange={(event) => setMagnet(event.target.value)}
                placeholder="magnet:?xt=urn:btih:..."
                className="h-24 w-full resize-none rounded-xl border border-[#dfdcd5] bg-white py-3 pl-10 pr-3 text-[12px] leading-5 text-[#3c3935] outline-none focus:border-[#d89b83]"
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <input
                ref={fileInputRef}
                type="file"
                accept=".torrent,application/x-bittorrent"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setTorrentFile(file);
                  if (file) setMagnet("");
                  event.target.value = "";
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex min-w-0 items-center gap-2 text-[11px] font-medium text-[#6f6b64] hover:text-[#2f2d29]"
              >
                <span className="shrink-0">{icons.plus}</span>
                <span className="max-w-[230px] truncate">
                  {torrentFile ? torrentFile.name : "Choose .torrent file"}
                </span>
              </button>
              <button
                onClick={addTorrent}
                disabled={!magnet.trim() && !torrentFile}
                className="rounded-lg bg-[#e95f34] px-4 py-2.5 text-[11px] font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Start download
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
