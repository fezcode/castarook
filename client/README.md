# Castarook - A Strategic Saga

Castarook is a 3D strategic board game heavily inspired by chess, but with a unique RPG twist. Instead of guaranteed captures, combat is determined by the fate of the dice (D6 to D20) and veteran stats, set within a beautiful, procedural low-poly environment.

## Features

- **RPG Combat System:** Every unit has a unique die. Health and damage are persistent.
- **Dynamic 3D Environment:** Procedurally generated terrain, day/night cycle, dynamic lighting, and weather effects.
- **Siege Warfare:** Utilize the powerful Onager once per match to rain destruction on enemy lines.
- **Veterancy:** Units gain kills and defense stats that improve their future dice rolls.
- **AI Opponent:** Play against a strategic AI (Beta) or challenge a friend in local PvP.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **3D Rendering:** Three.js + React Three Fiber (`@react-three/fiber`, `@react-three/drei`)

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the Development Server**
   ```bash
   npm run dev
   ```
   This will start the local server, typically on `http://localhost:5173/`.

3. **Build for Production**
   ```bash
   npm run build
   ```

## Deployment

This project is configured to be hosted on GitHub Pages. To deploy the latest version:

```bash
npm run deploy
```

*Note: Ensure you have `gh-pages` installed and your `vite.config.ts` base path matches your repository name.*
