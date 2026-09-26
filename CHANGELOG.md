# Changelog

All notable changes to **Pulse** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-09-26

### 🚀 Added
- **Document Picture-in-Picture Mini Player**: Floating, always-on-top compact metronome window that stays visible across all browser tabs and desktop applications.
- **Google Meet-Style Automatic Tab Switching**: Automatically pops out the mini player to the bottom-right corner when switching away from the tab while the metronome is active, and closes cleanly upon return.
- **Top-Nav PiP Button & Shortcut**: Instant pop-out toggle directly from the top navigation bar or via the <kbd>P</kbd> keyboard shortcut.
- **Real-Time PiP Synchronization**: Live synchronized tempo stepper, BPM readout, dynamic beat tracking pills, and Play/Pause transport controls.
- **HTML Audio Carrier Node**: Routed audio engine output to a MediaStreamDestination carrier with MediaSession metadata for Chrome auto-PiP eligibility.

### 🎨 Refined & Changed
- **Restored Accent Toggle**: Reintroduced the manual Accent segmented toggle (`Off` / `On`) in the sidebar with `Off` as the default state for uniform beats out of the box.
- **Sidebar Breathing Room**: Added comfortable bottom padding below the Accent card for clean spacing and zero vertical scrollbar on standard viewports.
- **Symmetrical Mini Bar Layout**: Centered brand header and streamlined layout in the mini player window.

---

## [1.0.0] - 2026-09-25

### 🚀 Added
- **Living Cinemagraph Backdrop**: Seamless mountain sunset video backdrop with reflective water and subtle beat resonance.
- **High-Precision Audio Engine**: Sample-accurate timing powered by Web Audio API lookahead scheduling that never lags or drifts.
- **Super Loud Volume Boost**: Up to 350% Amp-Cut boost with soft saturation so the click cuts clearly through loud guitar amplifiers and acoustic playing.
- **1 2 3 4 Beat Tracker**: Minimalist, high-contrast beat indicator with automatic downbeat accent on Beat 1.
- **Popular Time Signatures**: Instant switching between `2/4`, `3/4`, `4/4`, `5/4`, and `6/8`.
- **Multiple Click Sounds**: Select between 4 distinct sound profiles: Click, Wood Block, Cowbell, and Clap.
- **Tempo Controls**: Smooth dial with sunset progress arc, central pendulum needle, precision steppers, and slider (30 to 300 BPM).
- **Collapsible Sidebar**: Press <kbd>H</kbd> or click the top-nav icon to hide controls for a 100% full-screen stage.
- **Node.js Streaming Server**: Lightweight backend server supporting HTTP Range requests for video streaming.

### 🎨 Refined & Changed
- **Single-Viewport Layout**: Guaranteed zero vertical scrolling across standard viewports with intentional bottom breathing room.
- **Spacious Sidebar Cards**: Evenly separated control cards with balanced padding and depth shadows.
- **Navbar Alignment**: Leveled and optically aligned `PRACTICE / PROGRESS / REPEAT` breadcrumbs with the Pulse brand logo.
- **Clean Root URL**: Streamlined direct serving so the browser address bar stays clean at `localhost:8000/` without exposing internal file paths.
- **Brand Simplification**: Cleaned up title and header text across the app and documentation to simply **Pulse**.
- **Project Structure**: Organized code into dedicated `frontend/`, `backend/`, and `media/` directories.

### 🧹 Removed
- Removed the "DOWN" label from Beat 1 for symmetrical, uniform beat pills.
- Removed redundant Accent, Visual, and Presets sections in favor of automatic downbeat accents.
- Removed the "Practice makes progress" text from the sidebar footer.
- Removed the moon theme toggle button from the navbar.
