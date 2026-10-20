// Movie Search App — full implementation
// TMDB API key is loaded from config.js (gitignored). See config.example.js.
const API_KEY = (window.CONFIG && window.CONFIG.API_KEY) || "YOUR_API_KEY";
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w342";
const USE_API = API_KEY !== "YOUR_API_KEY";

const FAV_KEY = "movie-favorites";
const THEME_KEY = "movie-theme";

const searchInput = document.getElementById("search");
const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status");
const emptyEl = document.getElementById("empty");
const genreSel = document.getElementById("genreFilter");
const tabs = document.querySelectorAll(".tab");
const favCountEl = document.getElementById("favCount");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");
const themeToggle = document.getElementById("themeToggle");
const modal = document.getElementById("modal");
const toast = document.getElementById("toast");

let allMovies = [];        // local dataset or TMDB results
let filtered = [];         // current view list
let favorites = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
let currentTab = "search";
let query = "";
let selectedGenre = "all";
let page = 1;
const PAGE_SIZE = 8;
let totalPages = 1;
let toastTimer;

// ---------- Theme ----------
function applyTheme(dark) {
  document.body.classList.toggle("light", !dark);
  themeToggle.textContent = dark ? "☀️" : "🌙";
}
applyTheme(localStorage.getItem(THEME_KEY) !== "light");
themeToggle.addEventListener("click", () => {
  const dark = document.body.classList.contains("light");
  applyTheme(dark);
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
});

// ---------- Helpers ----------
function saveFavs() { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); }
function isFav(id) { return favorites.some(f => f.id === id); }
function setStatus(msg) { statusEl.textContent = msg; }
function showToast(msg) {
  toast.textContent = msg; toast.classList.remove("hidden");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.add("hidden"), 2000);
}
function debounce(fn, delay = 400) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), delay); }; }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }

// ---------- Data loading ----------
async function loadInitial() {
  setStatus("Loading...");
  if (USE_API) {
    try {
      const res = await fetch(`${BASE}/genre/movie/list?api_key=${API_KEY}`);
      const g = await res.json();
      (g.genres || []).forEach(gn => {
        const opt = document.createElement("option");
        opt.value = gn.id; opt.textContent = gn.name;
        genreSel.appendChild(opt);
      });
      await fetchPopular();
      return;
    } catch (e) { /* fall through to local */ }
  }
  // local fallback
  genreSel.style.display = "none";
  try {
    const res = await fetch("movies.json");
    allMovies = await res.json();
  } catch (e) {
    allMovies = [];
    setStatus("Could not load movies. Serve via http server.");
    return;
  }
  buildLocalGenres();
  applyFilters();
  setStatus("");
}

async function fetchPopular(p = 1) {
  setStatus("Loading popular movies...");
  try {
    const res = await fetch(`${BASE}/movie/popular?api_key=${API_KEY}&page=${p}`);
    const data = await res.json();
    allMovies = data.results || [];
    totalPages = Math.min(data.total_pages || 1, 20);
    page = p;
    filtered = allMovies;
    renderPage();
    setStatus("");
  } catch (e) {
    setStatus("Failed to load. Check API key.");
  }
}

async function searchAPI(q, p = 1) {
  if (!q.trim()) { fetchPopular(p); return; }
  setStatus("Searching...");
  try {
    const res = await fetch(`${BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&page=${p}`);
    const data = await res.json();
    allMovies = data.results || [];
    totalPages = Math.min(data.total_pages || 1, 20);
    page = p;
    filtered = allMovies;
    renderPage();
    setStatus(allMovies.length ? "" : "No results found.");
  } catch (e) {
    setStatus("Search failed.");
  }
}

function buildLocalGenres() {
  const genres = [...new Set(allMovies.map(m => m.genre).filter(Boolean))];
  genres.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g; opt.textContent = g;
    genreSel.appendChild(opt);
  });
}

function applyFilters() {
  const q = query.toLowerCase().trim();
  filtered = allMovies.filter(m => {
    const matchQ = !q || m.title.toLowerCase().includes(q) || (m.overview || "").toLowerCase().includes(q);
    const matchG = selectedGenre === "all" || m.genre === selectedGenre;
    return matchQ && matchG;
  });
  totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (page > totalPages) page = totalPages;
  if (page < 1) page = 1;
  renderPage();
  setStatus(filtered.length ? "" : "No movies found.");
}

function renderPage() {
  const start = (page - 1) * PAGE_SIZE;
  const slice = USE_API ? filtered : filtered.slice(start, start + PAGE_SIZE);
  if (currentTab === "favorites") {
    renderFavorites();
    return;
  }
  if (!slice.length) {
    resultsEl.innerHTML = "";
    emptyEl.classList.remove("hidden");
  } else {
    emptyEl.classList.add("hidden");
    resultsEl.innerHTML = slice.map(m => movieCard(m)).join("");
    attachCardEvents();
  }
  pageInfo.textContent = `Page ${page} / ${totalPages}`;
  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= totalPages;
  favCountEl.textContent = favorites.length;
}

function movieCard(m) {
  const poster = USE_API ? (m.poster_path ? IMG + m.poster_path : "") : m.poster_path;
  const title = escapeHtml(m.title);
  const rating = (m.vote_average ?? 0).toFixed(1);
  const year = (m.release_date || "").slice(0, 4);
  const fav = isFav(m.id);
  return `
    <div class="movie" data-id="${m.id}">
      <button class="fav-badge ${fav ? "active" : ""}" data-fav="${m.id}" title="Favorite">${fav ? "❤️" : "🤍"}</button>
      <img src="${poster}" alt="${title}" loading="lazy" data-view="${m.id}" />
      <div class="movie-info">
        <h3>${title}</h3>
        <p>⭐ ${rating} · ${year}</p>
      </div>
    </div>`;
}

function attachCardEvents() {
  resultsEl.querySelectorAll("[data-view]").forEach(el =>
    el.addEventListener("click", () => openModal(+el.dataset.view)));
  resultsEl.querySelectorAll("[data-fav]").forEach(btn =>
    btn.addEventListener("click", (e) => { e.stopPropagation(); toggleFav(+btn.dataset.fav); }));
}

// ---------- Favorites ----------
function toggleFav(id) {
  const movie = (USE_API ? allMovies : allMovies).find(m => m.id === id) ||
               favorites.find(f => f.id === id);
  if (isFav(id)) {
    favorites = favorites.filter(f => f.id !== id);
    showToast("Removed from favorites");
  } else {
    if (movie) {
      favorites.push({ id: movie.id, title: movie.title, poster_path: movie.poster_path, vote_average: movie.vote_average, release_date: movie.release_date, overview: movie.overview });
      showToast("Added to favorites ❤️");
    }
  }
  saveFavs();
  favCountEl.textContent = favorites.length;
  renderPage();
}

function renderFavorites() {
  if (!favorites.length) {
    resultsEl.innerHTML = "";
    emptyEl.classList.remove("hidden");
    emptyEl.textContent = "No favorites yet. Click ❤️ on a movie.";
    pageInfo.textContent = "Favorites";
    prevBtn.disabled = true; nextBtn.disabled = true;
    return;
  }
  emptyEl.classList.add("hidden");
  resultsEl.innerHTML = favorites.map(m => movieCard(m)).join("");
  attachCardEvents();
  pageInfo.textContent = `${favorites.length} favorite(s)`;
  prevBtn.disabled = true; nextBtn.disabled = true;
}

// ---------- Modal ----------
const modalEl = document.getElementById("modal");
function openModal(id) {
  let m = (USE_API ? allMovies : allMovies).find(x => x.id === id) || favorites.find(x => x.id === id);
  if (!m) return;
  document.getElementById("modalImg").src = USE_API ? (m.poster_path ? IMG + m.poster_path : "") : m.poster_path;
  document.getElementById("modalImg").alt = m.title;
  document.getElementById("modalTitle").textContent = m.title;
  document.getElementById("modalMeta").textContent = `⭐ ${(m.vote_average ?? 0).toFixed(1)} · ${(m.release_date || "").slice(0,4)}${m.genre ? " · " + m.genre : ""}`;
  document.getElementById("modalOverview").textContent = m.overview || "No overview available.";
  const favBtn = document.getElementById("modalFav");
  favBtn.textContent = isFav(m.id) ? "💔 Remove from Favorites" : "❤️ Add to Favorites";
  favBtn.onclick = () => { toggleFav(m.id); openModal(m.id); };
  modalEl.classList.remove("hidden");
}
function closeModal() { modalEl.classList.add("hidden"); }
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalBackdrop").addEventListener("click", closeModal);

// ---------- Tabs ----------
tabs.forEach(t => t.addEventListener("click", () => {
  tabs.forEach(x => x.classList.remove("active"));
  t.classList.add("active");
  currentTab = t.dataset.tab;
  renderPage();
}));

// ---------- Search ----------
searchInput.addEventListener("input", debounce((e) => {
  query = e.target.value;
  page = 1;
  if (USE_API) searchAPI(query, 1);
  else applyFilters();
}, 400));

genreSel.addEventListener("change", (e) => {
  selectedGenre = e.target.value;
  page = 1;
  if (USE_API) {
    // re-search current query with genre not supported simply; just re-search
    searchAPI(query, 1);
  } else applyFilters();
});

// ---------- Pagination ----------
prevBtn.addEventListener("click", () => {
  if (page > 1) {
    page--;
    if (USE_API) searchAPI(query, page); else applyFilters();
  }
});
nextBtn.addEventListener("click", () => {
  if (page < totalPages) {
    page++;
    if (USE_API) searchAPI(query, page); else applyFilters();
  }
});

// ---------- Init ----------
favCountEl.textContent = favorites.length;
loadInitial();