<h3 align="center">
  <br />
  <a href="https://github.com/empyrealtear/piano-app"><img src="https://yasinates.com/piano-app.png" alt="piano-app" width="200" /></a>
  <br />
  Piano App
  <br />
</h3>

<hr />

<p align="center">This project is the <b>Piano App</b> web application. It is a beautiful, interactive 88-key piano you can play in your browser!</p>

<p align="center">
  · <a href="https://empyrealtear.github.io/piano-app/index.html">View Demo</a> ·
  <a href="https://github.com/empyrealtear/piano-app/issues">Report Bug / Request Feature</a> ·
</p>

---

## 📖 About

This project is a modern web-based 60-key piano simulator. It uses Tone.js and high-quality piano samples to provide a realistic piano playing experience directly in your browser. The interface is clean, responsive, and user-friendly.

### 💡 Purpose

To provide an accessible, interactive piano for learning, practice, and fun—no installation required, all running client-side in the browser.

## 🚀 Tech Stack

<table>
<tr>
  <td><a href="https://tonejs.github.io/">Tone.js</a></td>
  <td>Web audio synthesis and playback</td>
</tr>
<tr>
  <td><a href="https://developer.mozilla.org/en-US/docs/Web/HTML">HTML5</a></td>
  <td>Markup and structure</td>
</tr>
<tr>
  <td><a href="https://developer.mozilla.org/en-US/docs/Web/CSS">CSS3</a></td>
  <td>Modern, responsive styling</td>
</tr>
<tr>
  <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript">JavaScript</a></td>
  <td>Client-side logic</td>
</tr>
</table>

## 🧐 What's Inside?

- 🎹 **88-Key Piano**: Play all keys from A0 to C8
- 🖱️ **Mouse & Keyboard Support**: Play with your mouse or computer keyboard
- 🎧 **Realistic Sound**: High-quality sampled piano notes
- 🎚️ **Volume, Reverb, Octave Controls**: Adjust your sound
- 🕹️ **Sustain Pedal**: Use the spacebar for sustain
- 📱 **Responsive UI**: Works on desktop and mobile
- 📝 **No Backend**: All processing is done in the browser

## ⚡️ Getting Started

### 📦 Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- No installation required for demo

### 🚀 Local Usage

Just open `index.html` in your browser. No build step needed.

## ⚠️ Important: How to Run This Project

> **Note:** You cannot simply double-click `index.html` to run this app because browser security restrictions will prevent the audio samples from loading locally. You must serve the project with a local or remote web server.

### 🖥️ Recommended Ways to Run

#### 1. VS Code (Recommended)
- Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
- Right-click `index.html` and select **"Open with Live Server"**.
- The app will open in your browser and all features will work correctly.

#### 2. JetBrains IDEs (WebStorm, PhpStorm, etc.)
- Right-click `index.html` and choose **"Open in Browser"** (JetBrains IDEs automatically serve files over HTTP).
- Alternatively, use the built-in web server feature.

#### 3. Command Line (Windows, macOS, Linux)
- **Python 3** (cross-platform):
  ```sh
  python -m http.server 8000
  # Then open http://localhost:8000 in your browser
  ```
- **Node.js (http-server)**:
  ```sh
  npx http-server .
  # Then open the shown URL (usually http://localhost:8080)
  ```
- **PHP (if installed):**
  ```sh
  php -S localhost:8000
  # Then open http://localhost:8000
  ```

> Do not use the `file://` protocol (double-clicking the file) — audio samples will not load!

## 📚 Features

- Realistic, client-side piano sound
- Modern and clean UI
- No data leaves your device
- Supports mouse and keyboard input
- Responsive design for all devices

## 🔑 License

MIT License © 2025 Yasin Ateş
MIT License © 2025 empyrealtear

See [LICENSE](./LICENSE) for more information.
