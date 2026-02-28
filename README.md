# ⚔️ CASTAROOK: A Strategic Saga

Castarook is an immersive 3D chess game that blends standard chess strategy with D&D-inspired RPG elements. Set in a living, breathing valley featuring dynamic weather, procedural terrain, and a cinematic "Age of Empires" inspired interface.

## 📜 The Core Mechanics

Unlike regular chess, pieces in this saga don't always perish in a single strike. Every capture attempt initiates a **Battle Phase**.

### 🎲 Combat System
*   **Dice Rolls:** When one piece attacks another, both the Attacker and the Defender roll a **D20**.
*   **Attributes:** 
    *   **Attacker Total:** `D20 Roll + Veteran Kills`
    *   **Defender Total:** `D20 Roll + Walls Defended`
*   **Damage Calculation:** The difference between the two totals is dealt as damage to the loser's health.
*   **Health Points (HP):**
    *   **Pawn:** 10 HP
    *   **Knight / Bishop:** 20 HP
    *   **Rook:** 30 HP
    *   **Queen:** 40 HP
    *   **King:** 50 HP
*   **Survival:** If a unit takes damage but remains above 0 HP, it stays on its square. A capture only occurs when a unit's health is fully depleted.

### 👑 Special Rules
*   **Pawn Promotion:** Pawns reaching the far edge are automatically promoted to **Queens**, gaining full HP and range.
*   **Castling:** Perform a strategic swap between your King and Rook if neither has moved and the path is clear.
*   **Victory:** There is no "Checkmate" logic here—you must **execute the enemy King** by depleting his HP to win the campaign.

## 🌲 Immersive Environment

The battlefield is situated in a rich, low-poly world:
*   **Procedural Scenery:** Hills, valleys, and a winding river surround the board.
*   **Living World:** Animated trees, swaying grass, and wandering rabbits/horses react to a global wind system.
*   **Day/Night Cycle:** Toggle between a bright "Sunrise" and a flickering "Twilight" mode featuring firecamps and stars.
*   **Dynamic Wind:** Adjust the wind power from a gentle breeze to an aggressive storm in the settings.

## 🎨 Aesthetic & UI
*   **Age of Empires Style:** A cinematic HUD featuring gold-etched borders, serif typography, and a "War Chronicles" log.
*   **3D Animations:** Units perform lunging strikes during combat and physically fall over/sink into the dirt upon death.
*   **Customization:** Change board styles (Wood, Stone, Marble) and customize your army's colors via the Strategic Menu.

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Installation
1.  Clone the repository.
2.  Navigate to the client directory:
    ```bash
    cd client
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Launch the campaign:
    ```bash
    npm run dev
    ```

## 🛠️ Built With
*   **React** - UI Framework
*   **Three.js** - 3D Engine
*   **React Three Fiber** - React renderer for Three.js
*   **Drei** - Specialized helpers for 3D environments
*   **Vite** - Build Tool

---
Built for the **Workhammer Suite**. Roll for Initiative!
