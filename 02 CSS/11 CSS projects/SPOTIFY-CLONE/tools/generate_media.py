#!/usr/bin/env python3
"""Generate every binary media asset the Spotify clone needs.

Outputs (all paths relative to the SPOTIFY-CLONE folder, which is the
parent of the ``tools/`` directory holding this script):

  assets/player_icon6.png        pause icon matching player_icon3's style
  assets/card7img.jpeg           cover art - "Late Night Drive"
  assets/card8img.jpeg           cover art - "Monsoon"
  assets/card9img.jpeg           cover art - "Focus Flow"
  assets/audio/track-*.mp3       9 royalty-free demo tracks (numpy synthesis)

Run:  python tools/generate_media.py
Requires: Pillow, numpy, ffmpeg on PATH.
"""

from __future__ import annotations

import subprocess
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
AUDIO = ASSETS / "audio"
SR = 44100
R = np.random.default_rng(20261012)

# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------

def find_bold_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for candidate in (
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\seguisb.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ):
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


def vgrad(w: int, h: int, colors: list[tuple[int, int, int]]) -> Image.Image:
    """Vertical multi-stop gradient as an RGB image."""
    cols = np.asarray(colors, dtype=np.float32)
    k = len(colors)
    t = np.linspace(0, 1, h) * (k - 1)
    i = np.clip(t.astype(int), 0, k - 2)
    f = (t - i)[:, None]
    rows = cols[i] * (1 - f) + cols[i + 1] * f
    arr = np.repeat(rows[:, None, :], w, axis=1)
    return Image.fromarray(arr.astype(np.uint8), "RGB")


def add_grain(img: Image.Image, amount: int = 9) -> Image.Image:
    arr = np.asarray(img).astype(np.int16)
    arr += R.integers(-amount, amount + 1, size=arr.shape)
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


def cover_text(img: Image.Image, lines: list[str]) -> Image.Image:
    d = ImageDraw.Draw(img)
    font = find_bold_font(30)
    x, y = 18, img.height - 18 - 34 * len(lines)
    for line in lines:
        d.text((x + 2, y + 2), line, font=font, fill=(0, 0, 0, 200))
        d.text((x, y), line, font=font, fill=(255, 255, 255, 255))
        y += 34
    return img


# --------------------------------------------------------------------------
# 1. pause icon (matches player_icon3: white disc, black glyph)
# --------------------------------------------------------------------------

def make_pause_icon() -> None:
    w, h, s = 101, 100, 4
    img = Image.new("RGBA", (w * s, h * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([1 * s, 1 * s, (w - 1) * s, (h - 1) * s], fill=(255, 255, 255, 255))
    bar_w, bar_h, gap = 13 * s, 38 * s, 12 * s
    cx, cy = w * s / 2, h * s / 2
    y0, y1 = cy - bar_h / 2, cy + bar_h / 2
    d.rounded_rectangle([cx - gap / 2 - bar_w, y0, cx - gap / 2, y1],
                        radius=3 * s, fill=(0, 0, 0, 255))
    d.rounded_rectangle([cx + gap / 2, y0, cx + gap / 2 + bar_w, y1],
                        radius=3 * s, fill=(0, 0, 0, 255))
    img.resize((w, h), Image.LANCZOS).save(ASSETS / "player_icon6.png")
    print("wrote assets/player_icon6.png")


# --------------------------------------------------------------------------
# 2. playlist cover art (300x300, text baked in like the Top-50 covers)
# --------------------------------------------------------------------------

def cover_drive() -> None:
    img = vgrad(300, 300, [(24, 16, 64), (48, 24, 96), (8, 6, 20)])
    layer = Image.new("RGBA", (300, 300), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([195, 28, 275, 108], fill=(235, 230, 255, 235))      # moon
    d.ellipse([185, 38, 225, 78], fill=(48, 24, 96, 255))          # crescent cut
    for y, wd, col in ((150, 250, (255, 190, 90, 160)),
                       (185, 200, (255, 120, 120, 150)),
                       (220, 260, (120, 200, 255, 150))):
        d.rounded_rectangle([150 - wd // 2, y, 150 + wd // 2, y + 5],
                            radius=2, fill=col)                   # light streaks
    img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    img = img.filter(ImageFilter.GaussianBlur(0.6))
    cover_text(add_grain(img), ["Late Night", "Drive"]).save(ASSETS / "card7img.jpeg", quality=88)
    print("wrote assets/card7img.jpeg")


def cover_monsoon() -> None:
    img = vgrad(300, 300, [(8, 60, 74), (10, 90, 110), (6, 26, 40)])
    layer = Image.new("RGBA", (300, 300), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for cx, cy, rx, ry in ((90, 70, 70, 30), (160, 58, 80, 34), (220, 76, 60, 26)):
        d.ellipse([cx - rx, cy - ry, cx + rx, cx + ry], fill=(16, 34, 48, 230))
    for _ in range(130):                                          # rain
        x0, y0 = R.integers(0, 300), R.integers(90, 300)
        d.line([x0, y0, x0 - 7, y0 + 22], fill=(180, 220, 235, 110), width=2)
    img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    cover_text(add_grain(img), ["Monsoon"]).save(ASSETS / "card8img.jpeg", quality=88)
    print("wrote assets/card8img.jpeg")


def cover_focus() -> None:
    img = vgrad(300, 300, [(6, 10, 8), (10, 22, 18), (4, 6, 5)])
    layer = Image.new("RGBA", (300, 300), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for r, col in ((120, (30, 215, 96, 70)), (95, (30, 215, 96, 110)),
                   (70, (120, 255, 170, 150)), (45, (200, 255, 220, 190))):
        d.ellipse([150 - r, 130 - r, 150 + r, 130 + r], outline=col, width=5)
    d.ellipse([142, 122, 158, 138], fill=(30, 215, 96, 255))
    img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    cover_text(add_grain(img), ["Focus", "Flow"]).save(ASSETS / "card9img.jpeg", quality=88)
    print("wrote assets/card9img.jpeg")


# --------------------------------------------------------------------------
# 3. music synthesis
# --------------------------------------------------------------------------

SCALES = {
    "major": [0, 2, 4, 5, 7, 9, 11],
    "minor": [0, 2, 3, 5, 7, 8, 10],
    "dorian": [0, 2, 3, 5, 7, 9, 10],
    "harm_min": [0, 2, 3, 5, 7, 8, 11],
    "mixo": [0, 2, 4, 5, 7, 9, 10],
}


def midi_hz(n: float) -> float:
    return 440.0 * 2.0 ** ((n - 69) / 12.0)


def deg_midi(root: int, scale: list[int], deg: int) -> int:
    octv, idx = divmod(deg, len(scale))
    return root + 12 * octv + scale[idx]


def chord_midis(root: int, scale: list[int], degree: int, seventh: bool = False) -> list[int]:
    ds = [degree, degree + 2, degree + 4]
    if seventh:
        ds.append(degree + 6)
    return [deg_midi(root, scale, d) for d in ds]


def osc(kind: str, freq: float, n: int, vib_rate: float = 0.0, vib_amt: float = 0.0) -> np.ndarray:
    t = np.arange(n) / SR
    cyc = freq * t
    if vib_rate > 0:
        cyc = cyc + vib_amt * np.sin(2 * np.pi * vib_rate * t)
    if kind == "sine":
        return np.sin(2 * np.pi * cyc)
    if kind == "triangle":
        x = np.zeros(n)
        for k in range(1, 22, 2):
            x += ((-1) ** ((k - 1) // 2)) * np.sin(2 * np.pi * k * cyc) / (k * k)
        return x * (8 / np.pi ** 2)
    if kind == "square":
        x = np.zeros(n)
        for k in range(1, 20, 2):
            if freq * k >= SR * 0.45:
                break
            x += np.sin(2 * np.pi * k * cyc) / k
        return x * (4 / np.pi)
    if kind == "saw":
        x = np.zeros(n)
        for k in range(1, 25):
            if freq * k >= SR * 0.45:
                break
            x += np.sin(2 * np.pi * k * cyc) / k
        return x * (2 / np.pi)
    if kind == "flute":
        return (np.sin(2 * np.pi * cyc) + 0.25 * np.sin(4 * np.pi * cyc)
                + 0.08 * np.sin(6 * np.pi * cyc))
    if kind == "sitar":
        amps = [1.0, 0.55, 0.4, 0.3, 0.22, 0.15, 0.1]
        x = np.zeros(n)
        for k, a in enumerate(amps, start=1):
            if freq * k >= SR * 0.45:
                break
            x += a * np.sin(2 * np.pi * k * cyc)
        return x / sum(amps)
    raise ValueError(kind)


def adsr(n: int, a: float, d: float, s: float, r: float) -> np.ndarray:
    na = min(n, int(a * SR))
    nd = min(max(n - na, 0), int(d * SR))
    nr = min(max(n - na - nd, 0), int(r * SR))
    ns = n - na - nd - nr
    parts = []
    if na:
        parts.append(np.linspace(0, 1, na, endpoint=False))
    if nd:
        parts.append(np.linspace(1, s, nd, endpoint=False))
    if ns:
        parts.append(np.full(ns, s))
    if nr:
        parts.append(np.linspace(s, 0, nr, endpoint=True))
    env = np.concatenate(parts) if parts else np.zeros(n)
    return np.pad(env, (0, max(0, n - len(env))))[:n]


def lowpass_fft(x: np.ndarray, cutoff: float) -> np.ndarray:
    X = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / (1 + (freqs / cutoff) ** 2), len(x))


def highpass_fft(x: np.ndarray, cutoff: float) -> np.ndarray:
    X = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * (freqs / cutoff) ** 2 / (1 + (freqs / cutoff) ** 2), len(x))


def fft_conv(x: np.ndarray, ir: np.ndarray) -> np.ndarray:
    n = len(x) + len(ir) - 1
    nfft = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[:n]


# -- drums --------------------------------------------------------------

def d_kick(dur: float = 0.22) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 48 + 82 * np.exp(-t * 40)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14)
    click = R.standard_normal(n) * np.exp(-t * 300) * 0.4
    return body + click


def d_snare(dur: float = 0.18) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = highpass_fft(R.standard_normal(n) * np.exp(-t * 22), 1400)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.5
    return noise * 0.9 + tone


def d_hat(dur: float = 0.05, open_: bool = False) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    return highpass_fft(R.standard_normal(n) * np.exp(-t * (12 if open_ else 70)), 6500) * 0.45


def d_clap() -> np.ndarray:
    n = int(0.2 * SR)
    t = np.arange(n) / SR
    env = sum(np.exp(-np.clip(t - d, 0, None) * 170) for d in (0, 0.012, 0.026))
    return highpass_fft(R.standard_normal(n) * env * np.exp(-t * 22), 1100) * 0.8


def d_tom(freq: float = 70.0, dur: float = 0.4) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = freq * 0.6 + freq * 0.4 * np.exp(-t * 20)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)


def d_tabla_low(dur: float = 0.28) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 95 + 60 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12)


def d_tabla_high(dur: float = 0.14) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * t) for a, f in ((1.0, 290), (0.5, 580), (0.3, 870)))
    return x * np.exp(-t * 32) * 0.7


def d_thump(dur: float = 0.3) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * 55 * t) * np.exp(-t * 16)


def d_tick() -> np.ndarray:
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    return highpass_fft(R.standard_normal(n) * np.exp(-t * 200), 3000) * 0.25


# -- arrangement ----------------------------------------------------------

DRUMS: dict[str, dict[str, list[int]]] = {
    "four":     {"kick": [0, 4, 8, 12], "snare": [], "clap": [4, 12],
                 "chat": [2, 6, 10, 14], "ohat": [], "tom": [], "extra": []},
    "boom":     {"kick": [0, 7, 10], "snare": [4, 12], "clap": [],
                 "chat": [0, 2, 4, 6, 8, 10, 12, 14], "ohat": [], "tom": [], "extra": []},
    "lofi":     {"kick": [0, 10], "snare": [4, 12], "clap": [],
                 "chat": [2, 6, 10, 14, 15], "ohat": [], "tom": [], "extra": []},
    "minimal":  {"kick": [0, 4, 8, 12], "snare": [], "clap": [4, 12],
                 "chat": [2, 6, 10, 14], "ohat": [6], "tom": [], "extra": []},
    "indian":   {"kick": [], "snare": [], "clap": [],
                 "chat": [0, 2, 4, 6, 8, 10, 12, 14], "ohat": [],
                 "tom": [], "extra": ["tabla"]},
    "cinematic":{"kick": [], "snare": [], "clap": [], "chat": [], "ohat": [],
                 "tom": [0, 6, 8, 14], "extra": ["boom4"]},
    "horror":   {"kick": [], "snare": [], "clap": [], "chat": [], "ohat": [],
                 "tom": [], "extra": ["heartbeat", "ticks"]},
    "none":     {"kick": [], "snare": [], "clap": [], "chat": [], "ohat": [],
                 "tom": [], "extra": []},
}

BASS_PATTERNS: dict[str, tuple[list[int], int]] = {
    "four": ([0, 4, 8, 12], 3), "offbeat": ([2, 6, 10, 14], 2),
    "boom": ([0, 10], 4), "whole": ([0], 14), "indian": ([0, 8], 3),
    "pulse": ([0, 8], 6),
}


class Song:
    def __init__(self, **kw):
        self.__dict__.update(kw)
        self.rng = np.random.default_rng(kw["seed"])
        self.scale = SCALES[kw["scale"]]
        self.step = 60.0 / kw["bpm"] / 4.0
        self.bars = max(8, round(42.0 / (16 * self.step)))
        self.n = int(self.bars * 16 * self.step * SR)
        self.L = np.zeros(self.n)
        self.R = np.zeros(self.n)

    def place(self, start: int, sig: np.ndarray, pan: float = 0.0, gain: float = 1.0) -> None:
        if start >= self.n:
            return
        sig = np.asarray(sig, dtype=float)[: self.n - start] * gain
        ang = (pan + 1) * np.pi / 4
        self.L[start: start + len(sig)] += sig * np.cos(ang)
        self.R[start: start + len(sig)] += sig * np.sin(ang)

    def at(self, bar: int, step_in_bar: int, swing: float = 0.0) -> int:
        pos = bar * 16 + step_in_bar
        if swing and step_in_bar % 2 == 1:
            pos += swing
        return int(pos * self.step * SR)

    def chord(self, bar: int) -> list[int]:
        return chord_midis(self.root, self.scale, self.prog[bar % len(self.prog)],
                           seventh=self.pad_seventh)

    # -- layers ------------------------------------------------------

    def render_drums(self) -> None:
        pat = DRUMS[self.drums]
        for bar in range(self.bars):
            if bar < 2 or bar >= self.bars - 1:
                sparse = (self.drums in ("cinematic", "horror"))
                if not sparse:
                    continue
            s = lambda st: self.at(bar, st, self.swing)  # noqa: E731
            for st in pat["kick"]:
                self.place(s(st), d_kick(), gain=0.9)
            for st in pat["snare"]:
                self.place(s(st), d_snare(), gain=0.7)
            for st in pat["clap"]:
                self.place(s(st), d_clap(), gain=0.55)
            for st in pat["chat"]:
                self.place(s(st), d_hat(), gain=0.4)
            for st in pat["ohat"]:
                self.place(s(st), d_hat(0.25, open_=True), gain=0.35)
            for st in pat["tom"]:
                self.place(s(st), d_tom(), gain=0.8)
            if "tabla" in pat["extra"]:
                for st in (0, 7, 8):
                    self.place(s(st), d_tabla_low(), gain=0.85)
                for st in (2, 4, 6, 10, 12, 14):
                    self.place(s(st), d_tabla_high(), gain=0.6)
            if "boom4" in pat["extra"] and bar % 4 == 0:
                self.place(s(0), d_thump(0.6), gain=1.0)
            if "heartbeat" in pat["extra"] and bar % 2 == 0:
                self.place(s(0), d_thump(), gain=0.9)
                self.place(s(3), d_thump(0.2), gain=0.6)
            if "ticks" in pat["extra"]:
                for st in range(0, 16, 2):
                    self.place(s(st), d_tick(), gain=0.5)

    def render_bass(self) -> None:
        steps, length = BASS_PATTERNS[self.bass_pat]
        for bar in range(self.bars):
            root = deg_midi(self.root, self.scale, self.prog[bar % len(self.prog)] - len(self.scale))
            for st in steps:
                dur = length * self.step
                n = int(dur * SR)
                if self.bass_kind == "pluck":
                    sig = osc("triangle", midi_hz(root), n) * adsr(n, 0.005, dur * 0.7, 0.1, 0.05)
                else:
                    sig = osc("sine", midi_hz(root), n) * adsr(n, 0.01, dur * 0.4, 0.7, dur * 0.3)
                self.place(self.at(bar, st, self.swing), lowpass_fft(sig, 500), gain=0.75)

    def render_pad(self) -> None:
        for bar in range(0, self.bars, 2):
            notes = self.chord(bar)
            dur = 2 * 16 * self.step + 1.0
            n = int(dur * SR)
            sig = np.zeros(n)
            for m in notes:
                sig += osc("triangle", midi_hz(m + 12), n) / len(notes)
            sig = lowpass_fft(sig, 1100) * adsr(n, 1.2, 1.0, 0.8, 2.0)
            self.place(self.at(bar, 0), sig, gain=0.30)

    def render_arp(self) -> None:
        if self.arp == "none":
            return
        sub = 2 if self.arp_sub == 8 else 1
        for bar in range(self.bars):
            notes = [m + 12 for m in self.chord(bar)]
            seq = notes if self.arp == "up" else notes[::-1] if self.arp == "down" \
                else notes + notes[-2:0:-1]
            for i, st in enumerate(range(0, 16, sub)):
                m = seq[i % len(seq)]
                dur = sub * self.step * 0.9
                n = int(dur * SR)
                sig = osc(self.arp_voice, midi_hz(m), n) * adsr(n, 0.005, dur * 0.8, 0.05, 0.04)
                self.place(self.at(bar, st, self.swing), sig,
                           pan=0.15 if i % 2 else -0.15, gain=0.30)

    def render_lead(self) -> None:
        for bar in range(self.bars):
            chord = self.chord(bar)
            st = 0
            while st < 16:
                if self.rng.random() > self.density:
                    st += 1
             
            while st < 16:
                if self.rng.random() > self.density:
                    st += 1
                    continue
                if self.rng.random() < 0.62:
                    deg = int(self.rng.choice(
                        [self.scale.index((c - self.root) % 12) for c in chord]))
                else:
                    deg = int(self.rng.integers(0, len(self.scale)))
                if self.rng.random() < 0.25:
                    deg += len(self.scale) * int(self.rng.choice([-1, 1]))
                midi = deg_midi(self.root, self.scale, deg + 2 * len(self.scale))
                dur = self.rng.choice([1, 1, 2, 2, 4]) * self.step * 0.92
                n = max(int(dur * SR), 64)
                sig = osc(self.lead_kind, midi_hz(midi), n,
                          vib_rate=self.lead_vib[0], vib_amt=self.lead_vib[1])
                sig = sig * adsr(n, 0.012, dur * 0.5, 0.5, min(0.08, dur * 0.3))
                if self.tremolo:
                    t = np.arange(n) / SR
                    sig = sig * (0.72 + 0.28 * np.sin(2 * np.pi * 5.2 * t))
                sig = lowpass_fft(sig, self.lead_cut)
                self.place(self.at(bar, st, self.swing), sig,
                           pan=float(self.rng.uniform(-0.2, 0.2)), gain=self.lead_gain)
                st += int(self.rng.choice([1, 1, 2, 2, 4]))

    def build(self) -> tuple[np.ndarray, np.ndarray]:
        self.render_pad()
        self.render_arp()
        self.render_bass()
        self.render_drums()
        self.render_lead()
        if self.vinyl:
            n = self.n
            noise = R.standard_normal(n)
            noise = lowpass_fft(noise, 4000) * 0.012
            self.L += noise
            self.R += noise
        for ch in ("L", "R"):
            a = getattr(self, ch)
            n_ir = int(1.7 * SR)
            t = np.arange(n_ir) / SR
            ir = R.standard_normal(n_ir) * np.exp(-3.5 * t / 1.7)
            ir = ir / max(np.max(np.abs(ir)), 1e-6) * 0.4
            wet = fft_conv(a, ir)[: self.n]
            setattr(self, ch, a + wet * 0.20)
        peak = max(np.max(np.abs(self.L)), np.max(np.abs(self.R)), 1e-6)
        self.L = np.tanh(self.L / peak * 1.05)
        self.R = np.tanh(self.R / peak * 1.05)
        peak = max(np.max(np.abs(self.L)), np.max(np.abs(self.R)), 1e-6)
        self.L *= 0.89 / peak
        self.R *= 0.89 / peak
        fi, fo = int(0.05 * SR), int(2.5 * SR)
        self.L[:fi] *= np.linspace(0, 1, fi)
        self.R[:fi] *= np.linspace(0, 1, fi)
        self.L[-fo:] *= np.linspace(1, 0, fo)
        self.R[-fo:] *= np.linspace(1, 0, fo)
        return self.L, self.R


TRACKS = [
    dict(file="track-01-neon-skyline.mp3", title="Neon Skyline", artist="Aurora Drive",
         bpm=118, root=45, scale="minor", prog=[0, 5, 2, 4], drums="four",
         bass_kind="sub", bass_pat="four", pad_seventh=True,
         lead_kind="square", lead_gain=0.30, lead_cut=5200, lead_vib=(5.5, 0.03),
         arp="up", arp_sub=8, arp_voice="saw", density=0.5, swing=0.0,
         tremolo=False, vinyl=False, seed=11),
    dict(file="track-02-golden-hour.mp3", title="Golden Hour", artist="Miya Solna",
         bpm=96, root=48, scale="major", prog=[5, 3, 0, 4], drums="lofi",
         bass_kind="pluck", bass_pat="boom", pad_seventh=False,
         lead_kind="triangle", lead_gain=0.5, lead_cut=6000, lead_vib=(5.0, 0.02),
         arp="updown", arp_sub=8, arp_voice="triangle", density=0.55, swing=0.12,
         tremolo=False, vinyl=False, seed=22),
    dict(file="track-03-paper-planes.mp3", title="Paper Planes", artist="The Quiet Ones",
         bpm=104, root=43, scale="major", prog=[0, 4, 5, 3], drums="boom",
         bass_kind="pluck", bass_pat="boom", pad_seventh=False,
         lead_kind="saw", lead_gain=0.28, lead_cut=3200, lead_vib=(5.2, 0.03),
         arp="none", arp_sub=8, arp_voice="triangle", density=0.45, swing=0.06,
         tremolo=False, vinyl=False, seed=33),
    dict(file="track-04-cold-open.mp3", title="Cold Open", artist="True Story Bro!",
         bpm=80, root=38, scale="minor", prog=[0, 2, 5, 4], drums="cinematic",
         bass_kind="sub", bass_pat="whole", pad_seventh=True,
         lead_kind="flute", lead_gain=0.5, lead_cut=5000, lead_vib=(4.6, 0.05),
         arp="none", arp_sub=8, arp_voice="sine", density=0.3, swing=0.0,
         tremolo=False, vinyl=False, seed=44),
    dict(file="track-05-dont-open-the-door.mp3", title="Don't Open The Door", artist="TMV Studios",
         bpm=66, root=37, scale="harm_min", prog=[0, 5, 2, 4], drums="horror",
         bass_kind="sub", bass_pat="whole", pad_seventh=True,
         lead_kind="sine", lead_gain=0.5, lead_cut=3600, lead_vib=(5.8, 0.04),
         arp="none", arp_sub=8, arp_voice="sine", density=0.25, swing=0.0,
         tremolo=True, vinyl=False, seed=55),
    dict(file="track-06-niti-chapter-1.mp3", title="Niti Chapter 1", artist="Kiran Chavda",
         bpm=92, root=38, scale="mixo", prog=[0, 5, 3, 4], drums="indian",
         bass_kind="sub", bass_pat="indian", pad_seventh=False,
         lead_kind="sitar", lead_gain=0.5, lead_cut=7000, lead_vib=(6.5, 0.03),
         arp="up", arp_sub=16, arp_voice="sitar", density=0.6, swing=0.0,
         tremolo=False, vinyl=False, seed=66),
    dict(file="track-07-coastline.mp3", title="Coastline", artist="Luma & Kite",
         bpm=84, root=41, scale="major", prog=[0, 5, 3, 4], drums="lofi",
         bass_kind="pluck", bass_pat="boom", pad_seventh=True,
         lead_kind="triangle", lead_gain=0.5, lead_cut=5200, lead_vib=(5.0, 0.025),
         arp="up", arp_sub=8, arp_voice="triangle", density=0.45, swing=0.22,
         tremolo=False, vinyl=True, seed=77),
    dict(file="track-08-rain-on-tin.mp3", title="Rain on Tin", artist="Aarav & The Tides",
         bpm=110, root=45, scale="major", prog=[0, 4, 5, 3], drums="four",
         bass_kind="sub", bass_pat="four", pad_seventh=False,
         lead_kind="triangle", lead_gain=0.42, lead_cut=6500, lead_vib=(5.4, 0.02),
         arp="up", arp_sub=16, arp_voice="triangle", density=0.55, swing=0.0,
         tremolo=False, vinyl=False, seed=88),
    dict(file="track-09-deep-end.mp3", title="Deep End", artist="Studio Minimal",
         bpm=122, root=40, scale="dorian", prog=[0, 0, 3, 4], drums="minimal",
         bass_kind="sub", bass_pat="offbeat", pad_seventh=True,
         lead_kind="saw", lead_gain=0.26, lead_cut=2800, lead_vib=(5.6, 0.03),
         arp="up", arp_sub=16, arp_voice="saw", density=0.4, swing=0.0,
         tremolo=False, vinyl=False, seed=99),
]


def synth_track(spec: dict) -> Path:
    song = Song(**{k: v for k, v in spec.items() if k not in ("file", "title", "artist")})
    L, R = song.build()
    stereo = np.stack([L, R], axis=1)
    pcm = (np.clip(stereo, -1, 1) * 32767).astype(np.int16)
    wav = AUDIO / (Path(spec["file"]).stem + ".wav")
    mp3 = AUDIO / spec["file"]
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(wav),
                    "-codec:a", "libmp3lame", "-b:a", "128k", "-ar", "44100", str(mp3)],
                   check=True)
    wav.unlink()
    dur = song.n / SR
    print(f"wrote {mp3.name}  ({dur:.1f}s, {mp3.stat().st_size // 1024} KB)")
    return mp3


def main() -> None:
    AUDIO.mkdir(exist_ok=True)
    make_pause_icon()
    cover_drive()
    cover_monsoon()
    cover_focus()
    for spec in TRACKS:
        synth_track(spec)
    print("all media assets ready.")


if __name__ == "__main__":
    main()