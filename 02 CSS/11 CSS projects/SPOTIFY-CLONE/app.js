/* =========================================================
   SPOTIFY CLONE — app.js
   Plain-JS music player: track catalogue, play / pause / seek,
   shuffle / repeat / queue, likes (localStorage), volume + mute,
   live search overlay, toasts. No dependencies.
   ========================================================= */
"use strict";

/* ---------- catalogue (matches the cards in index.html) ---------- */
const TRACKS = [
  { file: "assets/audio/track-01-neon-skyline.mp3", title: "Neon Skyline",
    artist: "Aurora Drive", playlist: "Top 50 - Global", cover: "assets/card1img.jpeg" },
  { file: "assets/audio/track-02-golden-hour.mp3", title: "Golden Hour",
    artist: "Miya Solna", playlist: "Daily Mix 1", cover: "assets/card2img.jpeg" },
  { file: "assets/audio/track-03-paper-planes.mp3", title: "Paper Planes",
    artist: "The Quiet Ones", playlist: "Discover Weekly", cover: "assets/card3img.jpeg" },
  { file: "assets/audio/track-04-cold-open.mp3", title: "Cold Open",
    artist: "True Story Bro!", playlist: "True Story Bro!", cover: "assets/card4img.jpeg" },
  { file: "assets/audio/track-05-dont-open-the-door.mp3", title: "Don't Open The Door",
    artist: "TMV Studios", playlist: "The Horror Show", cover: "assets/card5img.jpeg" },
  { file: "assets/audio/track-06-niti-chapter-1.mp3", title: "Niti Chapter 1",
    artist: "Kiran Chavda", playlist: "Chanakya Niti", cover: "assets/card6img.jpeg" },
  { file: "assets/audio/track-07-coastline.mp3", title: "Coastline",
    artist: "Luma & Kite", playlist: "Late Night Drive", cover: "assets/card7img.jpeg" },
  { file: "assets/audio/track-08-rain-on-tin.mp3", title: "Rain on Tin",
    artist: "Aarav & The Tides", playlist: "Monsoon", cover: "assets/card8img.jpeg" },
  { file: "assets/audio/track-09-deep-end.mp3", title: "Deep End",
    artist: "Studio Minimal", playlist: "Focus Flow", cover: "assets/card9img.jpeg" },
];

const PLAY_SRC = "./assets/player_icon3.png";
const PAUSE_SRC = "./assets/player_icon6.png";
const LIKES_KEY = "spotify-clone-likes";

/* ---------- element handles ---------- */
const $ = (id) => document.getElementById(id);
const audio = $("audio");
const playBtn = $("playBtn");
const prevBtn = $("prevBtn");
const nextBtn = $("nextBtn");
const shuffleBtn = $("shuffleBtn");
const repeatBtn = $("repeatBtn");
const likeBtn = $("likeBtn");
const albumArt = $("albumArt");
const songTitle = $("songTitle");
const songArtist = $("songArtist");
const currentTimeEl = $("currentTime");
const totalTimeEl = $("totalTime");
const progressBar = $("progressBar");
const progressFill = $("progressFill");
const progressKnob = $("progressKnob");
const volumeSlider = $("volumeSlider");
const muteBtn = $("muteBtn");
const queueBtn = $("queueBtn");
const queuePanel = $("queuePanel");
const queueList = $("queueList");
const queueClose = $("queueClose");
const queueReset = $("queueReset");
const toastEl = $("toast");
const searchOverlay = $("searchOverlay");
const searchInput = $("searchInput");
const searchResults = $("searchResults");
const searchClose = $("searchClose");
const navSearch = $("navSearch");
const navHome = $("navHome");
const libraryList = $("libraryList");

/* ---------- state ---------- */
let queue = TRACKS.map((_, i) => i); // order of play (shuffled in place)
let queuePos = 0;                    // position inside queue
let isPlaying = false;
let isShuffle = false;
let repeatMode = 0;                  // 0 = off, 1 = repeat all, 2 = repeat one
let liked = new Set();
let lastVolume = 0.7;
try {
  liked = new Set(JSON.parse(localStorage.getItem(LIKES_KEY) || "[]"));
} catch {
  liked = new Set();
}

const trackIndex = () => queue[queuePos];
const track = () => TRACKS[trackIndex()];

/* ---------- helpers ---------- */
function fmt(sec) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ":" + String(s).padStart(2, "0");
}

let toastTimer = null;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
}

function saveLikes() {
  try {
    localStorage.setItem(LIKES_KEY, JSON.stringify([...liked]));
  } catch {
    /* private mode etc. — likes just won't persist */
  }
}

/* ---------- core playback ---------- */
function loadTrack(queuePosition, autoplay) {
  queuePos = (queuePosition + queue.length) % queue.length;
  const t = track();
  const sameFile = audio.src === new URL(t.file, document.baseURI).href;
  if (!sameFile) {
    audio.src = t.file;
    totalTimeEl.textContent = "0:00";
    progressBar.setAttribute("aria-valuemax", "100");
  }
  albumArt.src = t.cover;
  albumArt.alt = t.playlist + " artwork";
  songTitle.textContent = t.title;
  songArtist.textContent = t.artist;
  document.title = t.title + " · " + t.artist + " | Spotify Clone";
  updateLikeIcon();
  renderQueue();
  if (autoplay) {
    play().catch(() => {
      /* autoplay blocked before any user gesture — stay paused */
      setPlaying(false);
    });
  } else if (!sameFile) {
    audio.currentTime = 0;
  }
  updateProgress();
}

async function play() {
  if (!audio.getAttribute("src")) loadTrack(queuePos, false);
  await audio.play();
}

function pause() {
  audio.pause();
}

function togglePlay() {
  if (isPlaying) pause();
  else play().catch(() => toast("Couldn't start playback for this file"));
}

function setPlaying(on) {
  isPlaying = on;
  playBtn.src = on ? PAUSE_SRC : PLAY_SRC;
  playBtn.alt = on ? "Pause" : "Play";
  document.querySelectorAll(".card").forEach((card) => {
    card.classList.toggle(
      "now-playing",
      Number(card.dataset.track) === trackIndex() && on
    );
  });
}

function step(dir) {
  if (repeatMode === 2 && dir === 1 && audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  loadTrack(queuePos + dir, true);
}

function reshuffle(keepCurrent) {
  const rest = queue.filter((_, i) => i !== queuePos);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  const current = keepCurrent ? queue[queuePos] : rest.shift();
  queue = keepCurrent ? [current, ...rest] : [current, ...rest];
  queuePos = 0;
  renderQueue();
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("toggled", isShuffle);
  shuffleBtn.setAttribute("aria-pressed", String(isShuffle));
  if (isShuffle) {
    reshuffle(true);
    toast("Shuffle on");
  } else {
    const current = trackIndex();
    queue = TRACKS.map((_, i) => i);
    queuePos = current;
    renderQueue();
    toast("Shuffle off");
  }
}

function cycleRepeat() {
  repeatMode = (repeatMode + 1) % 3;
  repeatBtn.classList.toggle("toggled", repeatMode > 0);
  repeatBtn.classList.toggle("repeat-one", repeatMode === 2);
  repeatBtn.setAttribute("aria-pressed", String(repeatMode > 0));
  repeatBtn.setAttribute(
    "aria-label",
    ["Repeat off", "Repeat all", "Repeat one"][repeatMode]
  );
  toast(["Repeat off", "Repeat all", "Repeat one"][repeatMode]);
}

/* ---------- progress + seek ---------- */
function updateProgress() {
  const dur = audio.duration || 0;
  const cur = audio.currentTime || 0;
  const pct = dur > 0 ? (cur / dur) * 100 : 0;
  progressFill.style.width = pct + "%";
  progressKnob.style.left = pct + "%";
  progressBar.setAttribute("aria-valuenow", String(Math.round(pct)));
  currentTimeEl.textContent = fmt(cur);
  if (dur > 0) totalTimeEl.textContent = fmt(dur);
}

function seekFromEvent(e) {
  const rect = progressBar.getBoundingClientRect();
  const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
  if (audio.duration) audio.currentTime = ratio * audio.duration;
  updateProgress();
}

let wasPlayingBeforeScrub = false;
function scrubStart(e) {
  wasPlayingBeforeScrub = isPlaying;
  if (isPlaying) pause();
  seekFromEvent(e);
  const move = (ev) => seekFromEvent(ev);
  const up = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    if (wasPlayingBeforeScrub) play().catch(() => {});
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}

/* ---------- volume ---------- */
function applyVolume() {
  audio.volume = Number(volumeSlider.value) / 100;
  audio.muted = audio.volume === 0;
  muteBtn.className = audio.muted || audio.volume === 0
    ? "fa-solid fa-volume-xmark"
    : audio.volume < 0.5
      ? "fa-solid fa-volume-low"
      : "fa-solid fa-volume-high";
}

function toggleMute() {
  if (audio.muted || audio.volume === 0) {
    volumeSlider.value = Math.round(lastVolume * 100) || 70;
  } else {
    lastVolume = audio.volume;
    volumeSlider.value = 0;
  }
  applyVolume();
}

/* ---------- likes ---------- */
function updateLikeIcon() {
  const on = liked.has(trackIndex());
  likeBtn.classList.toggle("fa-solid", on);
  likeBtn.classList.toggle("fa-regular", !on);
  likeBtn.classList.toggle("liked", on);
  likeBtn.setAttribute("aria-pressed", String(on));
}

function toggleLike() {
  const i = trackIndex();
  if (liked.has(i)) {
    liked.delete(i);
    toast("Removed from Liked Songs");
  } else {
    liked.add(i);
    toast("Added to Liked Songs");
  }
  saveLikes();
  updateLikeIcon();
  renderLibrary();
}

/* ---------- queue panel ---------- */
function renderQueue() {
  queueList.innerHTML = "";
  queue.forEach((trackIdx, pos) => {
    const t = TRACKS[trackIdx];
    const li = document.createElement("li");
    li.className = "queue-item" + (pos === queuePos ? " current" : "");
    if (pos === queuePos) li.setAttribute("aria-current", "true");

    const img = document.createElement("img");
    img.src = t.cover;
    img.alt = "";
    const meta = document.createElement("span");
    meta.className = "queue-item-text";
    const strong = document.createElement("strong");
    strong.textContent = t.title;
    const small = document.createElement("small");
    small.textContent = t.artist;
    meta.append(strong, small);

    const eq = document.createElement("span");
    eq.className = "queue-eq";
    eq.innerHTML = "<span></span><span></span><span></span>";

    li.append(img, meta, eq);
    li.addEventListener("click", () => loadTrack(pos, true));
    queueList.appendChild(li);
  });
}

function setQueueOpen(open) {
  queuePanel.classList.toggle("open", open);
  queueBtn.setAttribute("aria-pressed", String(open));
  queueBtn.classList.toggle("toggled", open);
}

/* ---------- library list ---------- */
function renderLibrary() {
  const entries = [
    { name: "Liked Songs", desc: "Playlist · " + liked.size + " songs", icon: "fa-heart", track: null },
    ...TRACKS.slice(0, 5).map((t, i) => ({
      name: t.playlist, desc: "Playlist · " + t.artist, icon: null, cover: t.cover, track: i,
    })),
  ];
  libraryList.innerHTML = "";
  entries.forEach((e) => {
    const li = document.createElement("li");
    li.className = "lib-entry";
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    const art = document.createElement("span");
    art.className = "lib-entry-art";
    if (e.cover) {
      const img = document.createElement("img");
      img.src = e.cover;
      img.alt = "";
      art.appendChild(img);
    } else {
      const icon = document.createElement("i");
      icon.className = "fa-solid " + e.icon;
      art.appendChild(icon);
    }
    const meta = document.createElement("span");
    meta.className = "lib-entry-text";
    const strong = document.createElement("strong");
    strong.textContent = e.name;
    const small = document.createElement("small");
    small.textContent = e.desc;
    meta.append(strong, small);
    li.append(art, meta);
    li.setAttribute("aria-label", "Play " + e.name);
    const go = () => {
      if (e.track === null) {
        if (liked.size === 0) {
          toast("You haven't liked any songs yet — tap the heart icon");
          return;
        }
        queue = [...liked];
        loadTrack(0, true);
      } else {
        queue = TRACKS.map((_, i) => i);
        const pos = queue.indexOf(e.track);
        loadTrack(pos, true);
      }
      if (isShuffle) {
        shuffleBtn.classList.remove("toggled");
        shuffleBtn.setAttribute("aria-pressed", "false");
        isShuffle = false;
      }
    };
    li.addEventListener("click", go);
    li.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        go();
      }
    });
    libraryList.appendChild(li);
  });
}

/* ---------- search ---------- */
function openSearch() {
  searchOverlay.classList.add("open");
  searchOverlay.setAttribute("aria-hidden", "false");
  searchInput.value = "";
  renderSearch("");
  setTimeout(() => searchInput.focus(), 30);
}

function closeSearch() {
  searchOverlay.classList.remove("open");
  searchOverlay.setAttribute("aria-hidden", "true");
}

function renderSearch(q) {
  const query = q.trim().toLowerCase();
  searchResults.innerHTML = "";
  const hits = TRACKS.map((t, i) => ({ t, i })).filter(({ t }) => {
    if (!query) return true;
    return (t.title + " " + t.artist + " " + t.playlist).toLowerCase().includes(query);
  });
  if (hits.length === 0) {
    const empty = document.createElement("p");
    empty.className = "search-empty";
    empty.textContent = 'No results for "' + q.trim() + '"';
    searchResults.appendChild(empty);
    return;
  }
  hits.forEach(({ t, i }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "search-result";
    btn.setAttribute("role", "option");
    const img = document.createElement("img");
    img.src = t.cover;
    img.alt = "";
    const txt = document.createElement("span");
    txt.className = "search-result-text";
    const strong = document.createElement("strong");
    strong.textContent = t.title;
    const small = document.createElement("small");
    small.textContent = t.artist + " · " + t.playlist;
    txt.append(strong, small);
    const icon = document.createElement("i");
    icon.className = "fa-solid fa-play";
    btn.append(img, txt, icon);
    btn.addEventListener("click", () => {
      queue = TRACKS.map((_, x) => x);
      loadTrack(queue.indexOf(i), true);
      closeSearch();
    });
    searchResults.appendChild(btn);
  });
}

/* ---------- wiring ---------- */
function activateOnKey(el, fn) {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  });
}

playBtn.addEventListener("click", togglePlay);
activateOnKey(playBtn, togglePlay);
prevBtn.addEventListener("click", () => step(-1));
activateOnKey(prevBtn, () => step(-1));
nextBtn.addEventListener("click", () => step(1));
activateOnKey(nextBtn, () => step(1));
shuffleBtn.addEventListener("click", toggleShuffle);
activateOnKey(shuffleBtn, toggleShuffle);
repeatBtn.addEventListener("click", cycleRepeat);
activateOnKey(repeatBtn, cycleRepeat);
likeBtn.addEventListener("click", toggleLike);
activateOnKey(likeBtn, toggleLike);
muteBtn.addEventListener("click", toggleMute);
activateOnKey(muteBtn, toggleMute);
queueBtn.addEventListener("click", () => setQueueOpen(!queuePanel.classList.contains("open")));
activateOnKey(queueBtn, () => setQueueOpen(!queuePanel.classList.contains("open")));
queueClose.addEventListener("click", () => setQueueOpen(false));
queueReset.addEventListener("click", () => {
  queue = TRACKS.map((_, i) => i);
  loadTrack(queue.indexOf(trackIndex()), false);
  toast("Queue reset");
});

progressBar.addEventListener("pointerdown", scrubStart);
progressBar.addEventListener("keydown", (e) => {
  if (!audio.duration) return;
  if (e.key === "ArrowRight") audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
  if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
  if (e.key === "Home") audio.currentTime = 0;
  updateProgress();
});

volumeSlider.addEventListener("input", applyVolume);

audio.addEventListener("play", () => setPlaying(true));
audio.addEventListener("pause", () => setPlaying(false));
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("loadedmetadata", updateProgress);
audio.addEventListener("ended", () => {
  if (repeatMode === 2) {
    audio.currentTime = 0;
    play().catch(() => {});
  } else if (queuePos < queue.length - 1 || repeatMode === 1) {
    loadTrack(queuePos + 1, true);
  } else {
    setPlaying(false);
    audio.currentTime = 0;
  }
});
audio.addEventListener("error", () => {
  if (audio.getAttribute("src")) toast("Couldn't load that audio file");
});

/* cards: click / keyboard */
document.querySelectorAll(".card[data-track]").forEach((card) => {
  const go = () => {
    const i = Number(card.dataset.track);
    queue = TRACKS.map((_, x) => x);
    loadTrack(queue.indexOf(i), true);
    if (isShuffle) {
      shuffleBtn.classList.remove("toggled");
      shuffleBtn.setAttribute("aria-pressed", "false");
      isShuffle = false;
    }
  };
  card.addEventListener("click", go);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  });
});

/* search open / close */
function openSearchFromNav(e) {
  if (e) e.preventDefault();
  navSearch.classList.add("active");
  navHome.classList.remove("active");
  openSearch();
}
navSearch.addEventListener("click", openSearchFromNav);
activateOnKey(navSearch, openSearchFromNav);
navHome.addEventListener("click", (e) => {
  e.preventDefault();
  navHome.classList.add("active");
  navSearch.classList.remove("active");
  document.querySelector(".main-content").scrollTo({ top: 0, behavior: "smooth" });
});
searchInput.addEventListener("input", () => renderSearch(searchInput.value));
searchClose.addEventListener("click", closeSearch);
searchOverlay.addEventListener("click", (e) => {
  if (e.target === searchOverlay) closeSearch();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeSearch();
    setQueueOpen(false);
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openSearchFromNav();
  }
});

/* toast-only controls (decorative in the demo) */
document.querySelectorAll("[data-toast]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    toast(el.dataset.toast);
  });
  activateOnKey(el, () => toast(el.dataset.toast));
});

/* spacebar toggles play when focus is on the page body / cards */
document.addEventListener("keydown", (e) => {
  if (e.code !== "Space") return;
  const tag = (document.activeElement && document.activeElement.tagName) || "";
  if (["INPUT", "TEXTAREA", "BUTTON", "A"].includes(tag)) return;
  if (searchOverlay.classList.contains("open")) return;
  e.preventDefault();
  togglePlay();
});

/* media keys */
if ("mediaSession" in navigator) {
  try {
    navigator.mediaSession.setActionHandler("play", () => play().catch(() => {}));
    navigator.mediaSession.setActionHandler("pause", () => pause());
    navigator.mediaSession.setActionHandler("previoustrack", () => step(-1));
    navigator.mediaSession.setActionHandler("nexttrack", () => step(1));
  } catch {
    /* some browsers throw on unsupported actions */
  }
}

/* ---------- init ---------- */
applyVolume();
renderLibrary();
renderQueue();
loadTrack(0, false);
updateProgress();
