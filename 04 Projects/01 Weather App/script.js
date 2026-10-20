// Weather App — script
// TODO: replace with your OpenWeatherMap API key
const API_KEY = "YOUR_API_KEY";
const BASE = "https://api.openweathermap.org/data/2.5";

const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const locationBtn = document.getElementById("locationBtn");
const statusEl = document.getElementById("status");
const currentEl = document.getElementById("current");
const forecastEl = document.getElementById("forecast");

function setStatus(msg) { statusEl.textContent = msg; }

async function fetchWeather(city) {
  setStatus("Loading...");
  try {
    const res = await fetch(`${BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    renderCurrent(data);
    setStatus("");
  } catch (err) {
    setStatus(err.message);
    currentEl.classList.add("hidden");
  }
}

function renderCurrent(data) {
  currentEl.innerHTML = `
    <div class="card">
      <h2>${data.name}, ${data.sys.country}</h2>
      <p class="temp">${Math.round(data.main.temp)}°C</p>
      <p>${data.weather[0].description}</p>
    </div>`;
  currentEl.classList.remove("hidden");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (cityInput.value.trim()) fetchWeather(cityInput.value.trim());
});

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) return setStatus("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    const res = await fetch(`${BASE}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
    const data = await res.json();
    renderCurrent(data);
    setStatus("");
  }, () => setStatus("Location access denied"));
});

// TODO: add 5-day forecast, °C/°F toggle, localStorage recent searches