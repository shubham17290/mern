// Weather App — full implementation
// 1) Get a free API key from https://openweathermap.org/api
// 2) Paste it below (replace the placeholder).
const API_KEY = (window.CONFIG && window.CONFIG.API_KEY) || "YOUR_API_KEY";
const BASE = "https://api.openweathermap.org/data/2.5";

const RECENT_KEY = "weather-recent-cities";
const UNIT_KEY = "weather-unit";

const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const locationBtn = document.getElementById("locationBtn");
const unitToggle = document.getElementById("unitToggle");
const statusEl = document.getElementById("status");
const currentEl = document.getElementById("current");
const detailsEl = document.getElementById("details");
const forecastEl = document.getElementById("forecast");
const recentEl = document.getElementById("recent");

// ---------- State ----------
let unit = localStorage.getItem(UNIT_KEY) || "metric"; // metric | imperial
let lastData = null; // { current, forecast, city }
let recent = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");

// ---------- Init ----------
updateUnitButton();
renderRecent();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) searchCity(city);
});

locationBtn.addEventListener("click", useMyLocation);
unitToggle.addEventListener("click", toggleUnit);

// ---------- API helpers ----------
async function api(path) {
  const res = await fetch(`${BASE}${path}&appid=${API_KEY}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${res.status})`);
  }
  return res.json();
}

async function searchCity(city) {
  if (API_KEY === "YOUR_API_KEY") {
    return showError(
      "Please add your OpenWeatherMap API key in script.js (see README)."
    );
  }
  setLoading(`Searching "${city}"...`);
  try {
    const current = await api(
      `/weather?q=${encodeURIComponent(city)}&units=metric`
    );
    const forecast = await api(
      `/forecast?q=${encodeURIComponent(city)}&units=metric`
    );
    lastData = { current, forecast };
    saveRecent(current.name);
    renderAll();
    setStatus("");
  } catch (err) {
    showError(
      err.message === "city not found"
        ? `City "${city}" not found.`
        : err.message
    );
  }
}

async function useMyLocation() {
  if (!navigator.geolocation)
    return showError("Geolocation is not supported by your browser.");
  setLoading("Getting your location...");
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const current = await api(
          `/weather?lat=${latitude}&lon=${longitude}&units=metric`
        );
        const forecast = await api(
          `/forecast?lat=${latitude}&lon=${longitude}&units=metric`
        );
        lastData = { current, forecast };
        saveRecent(current.name);
        renderAll();
        setStatus("");
      } catch (err) {
        showError(err.message);
      }
    },
    () =>
      showError(
        "Location access denied. Please allow location or search manually."
      ),
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ---------- Rendering ----------
function renderAll() {
  if (!lastData) return;
  renderCurrent(lastData.current);
  renderDetails(lastData.current);
  renderForecast(lastData.forecast);
  currentEl.classList.remove("hidden");
  detailsEl.classList.remove("hidden");
  forecastEl.classList.remove("hidden");
}

function cToF(c) {
  return (c * 9) / 5 + 32;
}
function msToMph(ms) {
  return ms * 2.23694;
}
function fmtTemp(c) {
  const v = unit === "metric" ? c : cToF(c);
  return Math.round(v);
}
function fmtWind(ms) {
  if (unit === "metric") return `${Math.round(ms * 3.6)} km/h`;
  return `${Math.round(msToMph(ms))} mph`;
}
function fmtVisibility(m) {
  if (unit === "metric") return `${(m / 1000).toFixed(1)} km`;
  return `${(m / 1609.34).toFixed(1)} mi`;
}

function renderCurrent(d) {
  const icon = d.weather[0].icon;
  const date = new Date(d.dt * 1000).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
  currentEl.innerHTML = `
    <img class="icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${d.weather[0].description}" />
    <div class="info">
      <div class="city">${d.name}, ${d.sys.country}</div>
      <div class="date">${date}</div>
      <div class="temp">${fmtTemp(d.main.temp)}°${unit === "metric" ? "C" : "F"}</div>
      <div class="desc">${d.weather[0].description}</div>
    </div>`;
  // fix temp suffix spacing
  // temperature rendered above
}

function renderDetails(d) {
  detailsEl.innerHTML = `
    <div class="detail"><div class="label">Feels like</div><div class="value">${fmtTemp(d.main.feels_like)}°</div></div>
    <div class="detail"><div class="label">Humidity</div><div class="value">${d.main.humidity}%</div></div>
    <div class="detail"><div class="label">Wind</div><div class="value">${fmtWind(d.wind.speed)}</div></div>
    <div class="detail"><div class="label">Pressure</div><div class="value">${d.main.pressure} hPa</div></div>
    <div class="detail"><div class="label">Visibility</div><div class="value">${fmtVisibility(d.visibility)}</div></div>
    <div class="detail"><div class="label">Min / Max</div><div class="value">${fmtTemp(d.main.temp_min)}° / ${fmtTemp(d.main.temp_max)}°</div></div>`;
}

function renderForecast(f) {
  // Aggregate 3-hour entries into one per day (pick noon-ish entry)
  const byDay = {};
  f.list.forEach((item) => {
    const day = item.dt_txt.split(" ")[0];
    const hour = item.dt_txt.split(" ")[1];
    if (!byDay[day] || hour === "12:00:00") byDay[day] = item;
  });
  const days = Object.keys(byDay).slice(0, 5);

  forecastEl.innerHTML =
    `<h3>5-Day Forecast</h3><div class="forecast-grid">` +
    days
      .map((day) => {
        const it = byDay[day];
        const dname = new Date(day).toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric"
        });
        return `
        <div class="day">
          <div class="dname">${dname}</div>
          <img src="https://openweathermap.org/img/wn/${it.weather[0].icon}.png" alt="${it.weather[0].description}" />
          <div class="dtemp">${fmtTemp(it.main.temp)}°</div>
          <div class="ddesc">${it.weather[0].description}</div>
        </div>`;
      })
      .join("") +
    `</div>`;
}

// ---------- Unit toggle ----------
function toggleUnit() {
  unit = unit === "metric" ? "imperial" : "metric";
  localStorage.setItem(UNIT_KEY, unit);
  updateUnitButton();
  if (lastData) renderAll();
}
function updateUnitButton() {
  unitToggle.textContent = unit === "metric" ? "°C" : "°F";
  unitToggle.title =
    unit === "metric" ? "Switch to Fahrenheit" : "Switch to Celsius";
}

// ---------- Recent searches ----------
function saveRecent(city) {
  recent = [
    city,
    ...recent.filter((c) => c.toLowerCase() !== city.toLowerCase())
  ].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  renderRecent();
}
function renderRecent() {
  if (!recent.length) {
    recentEl.classList.add("hidden");
    recentEl.innerHTML = "";
    return;
  }
  recentEl.classList.remove("hidden");
  recentEl.innerHTML = recent
    .map(
      (c) =>
        `<span class="chip" data-city="${c}">${c}<span class="x" data-remove="${c}">×</span></span>`
    )
    .join("");
  recentEl.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      if (e.target.classList.contains("x")) {
        const city = e.target.dataset.remove;
        recent = recent.filter((c) => c !== city);
        localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
        renderRecent();
        e.stopPropagation();
      } else {
        searchCity(chip.dataset.city);
      }
    });
  });
}

// ---------- Status helpers ----------
function setStatus(msg) {
  statusEl.textContent = msg;
  statusEl.classList.remove("error", "loading");
}
function setLoading(msg) {
  statusEl.innerHTML = `<span class="spinner"></span>${msg}`;
  statusEl.classList.remove("error");
  statusEl.classList.add("loading");
}
function showError(msg) {
  statusEl.textContent = msg;
  statusEl.classList.add("error");
  statusEl.classList.remove("loading");
  currentEl.classList.add("hidden");
  detailsEl.classList.add("hidden");
  forecastEl.classList.add("hidden");
}

// ---------- Boot ----------
// Try to load last searched city if any
if (recent.length) {
  searchCity(recent[0]);
}
