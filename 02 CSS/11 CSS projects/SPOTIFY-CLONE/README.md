# Spotify Clone — CSS Project 🎧

A Spotify home-page clone built with plain **HTML + CSS + JavaScript**
(no frameworks). What starts as a CSS-layout study (flexbox sidebar,
grid card rows, sticky nav, fixed player bar) is finished as a **fully
working local music player**: click any card and real audio plays.

## Run it

No build step. Serve the folder with any static server and open it:

```bash
cd SPOTIFY-CLONE
python -m http.server 8000
# open http://127.0.0.1:8000/index.html
```

> Any static host works (VS Code Live Server, `npx serve`, GitHub Pages…).
> Plain `python -m http.server` is fine for looking around, but its lack of
> HTTP Range support makes seeking jump back to the start — use a
> Range-capable server for correct seeking.

## What works

- ▶️ / ⏸️ Play-pause, previous / next track
- Clickable + draggable progress bar (time labels update live)
- Shuffle, repeat off / repeat all / repeat one
- Play queue panel (click any row to jump, animated EQ on the live row)
- ❤️ Like songs — persisted in `localStorage`, with a live Liked Songs entry
- Volume slider + mute, live search overlay (`Ctrl/⌘+K`), toasts,
  keyboard support (cards, buttons, `Space`, arrows on the seek bar, `Esc`)
- MediaSession hooks (hardware media keys), responsive mobile layout,
  `prefers-reduced-motion` support

## Project structure

```
SPOTIFY-CLONE/
├── index.html          # layout: sidebar, content sections, player, overlays
├── style.css           # all styling — flexbox, grid, sticky + fixed bars
├── app.js              # player logic (no dependencies)
├── assets/
│   ├── logo.png, *_icon.png, card1-6img.jpeg …   # original course artwork
│   ├── player_icon6.png, card7-9img.jpeg         # generated (see below)
│   └── audio/track-*.mp3                        # 9 generated demo tracks
└── tools/
    └── generate_media.py  # regenerates every binary asset from scratch
```

## The music

There are no audio files to download — `tools/generate_media.py`
synthesises 9 royalty-free demo tracks with NumPy (chords, bass,
arpeggios, seeded melodies, style drum kits, reverb, mastering) and
encodes them with ffmpeg, plus the pause icon and three cover images:

```bash
pip install pillow numpy        # ffmpeg must be on PATH
python tools/generate_media.py
```

| # | Song | Style |
|---|------|-------|
| 1 | Neon Skyline — Aurora Drive | synthwave |
| 2 | Golden Hour — Miya Solna | acoustic pop |
| 3 | Paper Planes — The Quiet Ones | indie folk |
| 4 | Cold Open — True Story Bro! | cinematic ambient |
| 5 | Don't Open The Door — TMV Studios | dark ambient |
| 6 | Niti Chapter 1 — Kiran Chavda | Indian fusion |
| 7 | Coastline — Luma & Kite | lofi |
| 8 | Rain on Tin — Aarav & The Tides | tropical house |
| 9 | Deep End — Studio Minimal | deep house |

## CSS concepts used

Flexbox page + sidebar · CSS Grid card rows · `position: sticky` section
nav · `position: fixed` player bar · absolute overlays (queue, search,
toast) · transitions / keyframe EQ animation · custom range + progress
styling · media queries · attribute selectors (`[data-track]`,
`[data-toast]`) · `:focus-visible` / `:hover` states · custom scrollbars.

Built while learning full-stack web development (Apna College Sigma).
Clone for study purposes — artwork belongs to its owners, demo tracks are
generated locally and free to use.
