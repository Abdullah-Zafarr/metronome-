# Pulse

An ultra-loud, minimalist metronome engineered specifically for guitarists.

![Pulse Metronome Preview](media/readme%20screenshot%20.png)

---

## 🎸 Why Pulse is Different

Most online metronomes are generic beepers that get drowned out the second you plug into an amplifier or dig into an acoustic guitar.

**Pulse was built with one goal: cut through the noise and stay out of your way.**

* **Cuts Through Loud Amps**: Engineered with high-frequency, piercing transient clicks (inspired by stage gear like the Boss DB-90) and an on-board **350% Amp-Cut Boost** so you never lose the beat under heavy distortion.
* **Peripheral Beat Tracking**: The high-contrast `1 2 3 4` tracker with automatic downbeat accent pulses clearly in your peripheral vision—so you stay locked in the pocket without staring at the screen.
* **Zero Distractions, Single-Viewport Stage**: No ads, no scrolling, no clutter. A single cinematic viewport with a living mountain sunset backdrop. Tap **`H`** to hide all controls and practice in pure full-screen focus.
* **Rock-Solid Timing**: Powered by low-latency Web Audio API lookahead scheduling that never lags, skips, or drifts out of time.

---

## ⚡ Shortcuts
* **Spacebar** — Start / Stop Metronome
* **H** — Toggle Control Sidebar
* **↑ / ↓** — Adjust BPM by 1 (Hold **Shift** for ±5)

---

## 📁 Project Structure

```text
metronome-/
├── backend/          # Lightweight Node.js streaming server
├── frontend/         # Pure HTML/CSS/JS metronome application
├── media/            # Video cinemagraph, backdrops & assets
├── index.html        # Root entry redirect
└── package.json      # Project scripts
```
