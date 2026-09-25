# Contributing to Pulse

Thank you for your interest in contributing to **Pulse**! We welcome contributions from musicians, developers, and designers to help make this metronome even better.

---

## 🎯 Guiding Philosophy

Before submitting a feature or code change, please keep our core principles in mind:

1. **Keep It Minimalist**: Pulse is designed to be distraction-free. Avoid adding unnecessary menus, complex settings, or visual clutter.
2. **Built for Musicians**: Volume, clarity, and rock-solid timing are the top priorities. The click must remain loud and piercing enough to cut through live instruments.
3. **Lightweight & Fast**: No heavy frameworks or large dependencies. Pure HTML, Vanilla CSS, and native Web Audio API.

---

## 🛠️ How to Contribute

### 1. Reporting Bugs
- Check the [Issues](https://github.com/Abdullah-Zafarr/metronome-/issues) tab to see if the bug has already been reported.
- If not, open a new issue including:
  - A clear and descriptive title.
  - Steps to reproduce the problem.
  - Your browser, device, and operating system.
  - Screenshots or console errors (if applicable).

### 2. Suggesting Features
- We love new ideas! Open an issue with the label `enhancement` and describe:
  - The feature you'd like to see.
  - Why it benefits musicians and guitarists.
  - How it fits within the minimalist single-screen layout.

### 3. Submitting Pull Requests (PRs)
1. **Fork** the repository and clone your fork locally.
2. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**:
   - Maintain the organized folder structure:
     - `frontend/` — HTML, CSS, JavaScript
     - `backend/` — Node.js streaming server
     - `media/` — Audio, video, and image assets
   - Keep code clean, readable, and well-commented.
4. **Test thoroughly**:
   - Verify that timing is sample-accurate and does not drift.
   - Verify that the layout remains within a single viewport on standard screen sizes.
5. **Commit your changes**:
   ```bash
   git commit -m "Add descriptive commit message"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** against the `main` branch.

---

## 💻 Local Development

No complicated build tools are required:

```bash
# Clone the repository
git clone https://github.com/Abdullah-Zafarr/metronome-.git

# Navigate into the project
cd metronome-

# Option A: Start with Node.js backend (Recommended)
npm start

# Option B: Run with Python static server
python -m http.server 8000
```

Open your browser to `http://localhost:3000` or `http://localhost:8000`.

---

## 🤝 Code of Conduct

Please be respectful, kind, and collaborative. We are here to build great tools for musicians together!
