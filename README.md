# Interstellar

![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![ThreeJS](https://img.shields.io/badge/Three.js-WebGL-green?style=flat-square&logo=three.js)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-Build-purple?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/license-Unspecified-lightgrey?style=flat-square)

**Interstellar** is an interactive React + WebGL application designed to explore the scale of the universe. It invites users to journey from the microscopic world of atoms and cells to the immense vastness of planets, galaxies, and the observable cosmos.

This project focuses on **high-immersion visuals**, smooth scene transitions, and educational insights powered by an integrated AI assistant.

> **Note:** This project is intentionally **not lightweight**. It utilizes high-resolution textures, complex shaders, and multi-layered 3D scenes to prioritize visual depth over performance on low-end devices.

---

## Gallery

### Start Screen
![Start Screen](https://github.com/user-attachments/assets/6b4a20f3-c4da-4515-99e1-f4ce32e3e7a2)

### Galaxy view
![Galaxy View](https://github.com/user-attachments/assets/b4fb73f0-3e34-46b5-91bf-91b5c6ebb675)

### Microscopic details
![Solar System View](https://github.com/user-attachments/assets/45c88cb0-5c63-4ba8-b5ff-867302cb3788)

---

##  Features

* ** Multi-scene Exploration**
    Seamlessly travel through scales:
    `Atom` → `Cell` → `DNA` → `Earth` → `Solar System` → `Galaxy` → `Universe`
* ** High-detail Rendering**
    Features atmospheric scattering shaders, volumetric galaxy particles, dynamic starfields, and bloom/glow effects.
* ** AI Assistant Panel**
    Built-in chat interface connected to a local API for interactive explanations about the current view.
* ** Ambient Audio System**
    Immersive, looping space-themed ambience with an integrated mute toggle.
* ** Asset Preloader + Checkpoints**
    Smart loading system to reduce stutter and ensure scenes render correctly before transition.

---

## Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Core** | React 18, Vite |
| **3D / WebGL** | React Three Fiber (R3F), Drei, GLSL Shaders |
| **State Management** | Zustand (Global Scene Store) |
| **Styling/UI** | Tailwind CSS |
| **Interaction** | Lenis (Smooth Scrolling) |
| **Backend/AI** | Local Node API (`/api/chat.js`) |

---

## Project Structure

```text
.
├── api/
│   └── chat.js                 # Local API handler for AI
├── public/
│   ├── assets/                 # Static UI assets
│   ├── models/                 # GLTF/GLB 3D models
│   ├── sounds/                 # Audio files (bgm, sfx)
│   └── textures/               # High-res textures (Earth, Jupiter, etc.)
├── src/
│   ├── api/
│   │   └── openai.js           # OpenAI / AI Provider config
│   ├── components/
│   │   ├── ai/                 # Chat interface components
│   │   ├── layout/             # Main layout wrappers
│   │   ├── ui/                 # General UI elements (Buttons, Loaders)
│   │   ├── visual/             # Purely visual 3D components
│   │   ├── AmbientSound.jsx    # Audio manager
│   │   ├── SceneHUD.jsx        # Heads-up display overlay
│   │   └── WarpLines.jsx       # Transition effects
│   ├── hooks/
│   │   ├── useSceneStore.js    # Zustand store
│   │   ├── useScrollNavigation.js
│   │   ├── usePreloadAssets.js
│   │   ├── useLenis.js
│   │   └── sceneCheckpoints.js # Scroll trigger logic
│   ├── scenes/                 # Individual R3F Scenes
│   │   ├── AtomScene.jsx
│   │   ├── CellScene.jsx
│   │   ├── DnaScene.jsx
│   │   ├── EarthScene.jsx
│   │   ├── SolarScene.jsx
│   │   ├── GalaxyScene.jsx
│   │   └── UniverseScene.jsx
│   ├── shaders/                # Custom GLSL Shaders
│   │   ├── atmosphere/
│   │   ├── galaxy/
│   │   ├── glow/
│   │   └── universe/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
└── README.md
```

## Getting Started

Follow these steps to run the project locally.

### 1. Install Dependencies
```bash
npm install
```
### 2. Configure Environment
If you are using your own AI provider, make sure to configure your API keys.

* **Check:** `src/api/openai.js`
* **Or update the local handler:** `/api/chat.js`

### 3. Run Development Server
```bash
npm run dev
```

### 4. Known Issues
* **Performance:** `Heavy textures (4k/8k) may cause slow loading or frame drops on low-end GPUs.`
* **Compatibility:** `Some custom shader effects may not render correctly on browsers that do not support WebGL 2.0.`
* **Loading:** `Initial asset preload may freeze the main thread for a few seconds on slower connections.`
