# Pulse — Minimalist Metronome (Guitar Edition)

An ultra-loud, minimalist metronome engineered specifically for guitarists. Features sample-accurate audio timing, an integrated **1 2 3 4 Beat Tracker**, a living mountain sunset cinemagraph video backdrop, a collapsible control sidebar, and studio-grade dark/sunset-orange styling.

![Pulse Metronome Preview](media/readme%20screenshot%20.png)

---

## 📁 Project Structure

```text
metronome-/
├── backend/
│   └── server.js             # Lightweight Node.js server with HTTP Range video streaming
├── frontend/
│   ├── css/
│   │   └── style.css         # Single-viewport layout, thick black navbar & scrollbar
│   ├── js/
│   │   ├── app.js            # Main UI, BPM synchronization, and sidebar toggle logic
│   │   ├── audio-engine.js   # Web Audio sample-accurate click synthesis
│   │   └── water-cinemagraph.js # Visual resonance engine
│   └── index.html            # Main application UI
├── media/
│   ├── background video.mp4  # Seamless mountain sunset cinemagraph video
│   ├── pulse-bg.jpg          # High-resolution landscape fallback backdrop
│   └── readme screenshot .png# Application preview screenshot
├── index.html                # Root entry redirect to frontend/
├── package.json              # Project scripts & configuration
└── README.md
```

---

## 🎸 Features & Styling

1. **Full-Immersion Cinematic Stage (Left/Center)**:
   * **Single Viewport Height**: Fits 100% visible in one viewport with zero vertical scroll on the main stage.
   * **Thick Black Studio Navbar**: Sleek black header bar with integrated logo, breadcrumbs, theme toggle, and sidebar collapse button.
   * **Cinemagraph Video Backdrop**: Living mountain silhouettes with rippling reflective water and radiant crimson sun looping continuously in the background.
   * **Tempo Hero & Dial**: Large `90 BPM` display with smooth sunset-orange progress arc and center pendulum needle.
   * **1 2 3 4 Beat Tracker**:
     * **`1` (Downbeat)**: Accented **3800 Hz** piercing click with radiant sunset-orange pulse.
     * **`2`**, **`3`**, **`4`**: Sharp **2700 Hz** cutting clicks with solid silver-white flashes.
   * **Transport Bar**: Circular Play/Pause button (`Spacebar`) and `−5` / `+5` BPM skip buttons.

2. **Collapsible Control Sidebar (Right)**:
   * **Toggle / Hide Sidebar**: Press <kbd>H</kbd> or click the top-nav / sidebar header buttons to collapse the sidebar for a full-screen view. A quick-access floating tab allows opening it back up anytime.
   * **Thick Black Brutalist Scrollbar**: Styled with a solid 20px jet-black rectangular thumb on a dark track with a crisp divider border.
   * **Tempo Stepper & Slider**: Precision `−` / `+`, BPM pill, and smooth slider (30 to 300 BPM).
   * **Time Signature**: `2/4`, `3/4`, `4/4`, `5/4`, `6/8`.
   * **Sound Engine**: `Click` (Boss DB-90 guitar piercing sound), `Wood Block`, `Cowbell`, `Clap`.
   * **Volume Boost**: Up to **350%** ("Amp-Cut" boost) with real-time saturation.
   * **Accent Switch**: `Off` / `On`.
   * **Visual Modes**: `Circle`, `Bar`, `Dot` (peripheral screen flash).
   * **Presets**: `Beginner (60)`, `Warm Up (70)`, `Intermediate (90)`, `Advanced (120)`.

---

## 🚀 How to Run

### Option 1: Node.js Backend Server (Recommended)
```bash
npm start
```
Then visit **`http://localhost:3000`** in your browser.

### Option 2: Direct Browser / Static Server
Open **`index.html`** or **`frontend/index.html`** directly in any modern web browser or run:
```bash
python -m http.server 8000
```
Then visit **`http://localhost:8000`**.

---

### Shortcuts
* <kbd>Space</kbd> — Start / Stop Metronome
* <kbd>H</kbd> — Hide / Show Control Sidebar
* <kbd>↑</kbd> / <kbd>↓</kbd> — Increase / Decrease BPM by 1 (or hold <kbd>Shift</kbd> for 5)
