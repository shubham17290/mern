# Weather App 🌤️

A responsive weather app that fetches live weather data from the **OpenWeatherMap API**.

## Features
- Search weather by city name
- Auto-detect user location (Geolocation API)
- Current weather + 5-day forecast
- °C / °F toggle
- Loading & error states
- Recent searches saved in `localStorage`

## Tech Stack
HTML5 · CSS3 · Vanilla JavaScript · OpenWeatherMap API

## Setup
1. Get a free API key from [openweathermap.org](https://openweathermap.org/api)
2. Copy `config.example.js` to `config.js` and paste your key:
   ```js
   window.CONFIG = { API_KEY: "your_key_here" };
   ```
3. `config.js` is gitignored, so your key stays local.
4. Open `index.html` in a browser (or serve with `python -m http.server`).

## Resume Line
> Built a responsive weather app consuming the OpenWeatherMap REST API with geolocation, async/await, and localStorage caching.