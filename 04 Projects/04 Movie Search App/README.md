# Movie Search App 🎬

A movie discovery app with debounced search, API integration, favorites, and pagination.

## Features
- Search movies & series (TMDB / OMDb API)
- Debounced input for smooth searching
- Results grid with posters, rating, year
- Favorites list persisted in `localStorage`
- Detail view with plot, cast, trailer link
- Pagination / infinite scroll

## Tech Stack
HTML5 · CSS3 · Vanilla JavaScript · TMDB/OMDb API · debounce

## Setup
1. Get a free API key from [themoviedb.org](https://www.themoviedb.org/settings/api) (optional — app works offline with bundled sample data).
2. Copy `config.example.js` to `config.js` and paste your key:
   ```js
   window.CONFIG = { API_KEY: "your_key_here" };
   ```
   `config.js` is gitignored, so your key stays local.
3. Open `index.html` in a browser (serve via `python -m http.server` for `fetch`).

## Resume Line
> Created a movie discovery app with debounced search, API integration, favorites, and pagination.