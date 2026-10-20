// Movie Search App — script
// TODO: replace with your TMDB API key (v3)
const API_KEY = "YOUR_API_KEY";
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w300";

const searchInput = document.getElementById("search");
const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status");

function setStatus(msg) { statusEl.textContent = msg; }

function debounce(fn, delay = 400) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

async function searchMovies(query) {
  if (!query.trim()) { resultsEl.innerHTML = ""; setStatus(""); return; }
  setStatus("Searching...");
  try {
    const res = await fetch(`${BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    render(data.results || []);
    setStatus(data.results?.length ? "" : "No results found.");
  } catch (e) {
    setStatus("Something went wrong.");
  }
}

function render(list) {
  resultsEl.innerHTML = list.map(m => `
    <div class="movie">
      <img src="${m.poster_path ? IMG + m.poster_path : ""}" alt="${m.title}" loading="lazy" />
      <div class="movie-info">
        <h3>${m.title}</h3>
        <p>⭐ ${m.vote_average?.toFixed(1) ?? "N/A"} · ${m.release_date?.slice(0,4) ?? ""}</p>
      </div>
    </div>`).join("");
}

searchInput.addEventListener("input", debounce((e) => searchMovies(e.target.value)));
// TODO: add favorites (localStorage), detail modal, pagination