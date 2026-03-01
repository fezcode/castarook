# CASTAROOK Changelog

## [0.5.0] - 2026-03-01
### Added
- **Siege Overhaul:** Interactive 3D Onager models. Click to select and fire on single targets (12-16 DMG).
- **Opportunity Attack:** Moving units become "Vulnerable" (-2 DEF) until their next turn.
- **Audio Chronicles:** Comprehensive sound system with BGM, tactical SFX, and random ambient environment sounds (Wind, Wood-chopping, Shoveling).
- **Bullseye Visuals:** High-visibility pulsing energy field beneath vulnerable pieces.
- **Strategic Menu:** Added Audio controls (Volume/Mute) and session abandonment logic.
- **Credits:** Added "Architects of the Saga" section.

### Fixed
- **Input Transparency:** Health bars and stats are now "click-through" via raycast filtering.
- **Visual Stability:** Fixed decorative stones randomly changing positions during actions (Memoized Scenery).
- **Terrain Grounding:** Trees and vegetation now properly sink into the procedural hills.
- **Combat Logic:** Clamped battle totals to a minimum of 0 (no more negative defense results).

## [0.4.6] - 2026-03-01
### Added
- **Identity Rebranding:** Project officially renamed to **CASTAROOK**.
- **Piece-Specific Dice:** Combat now scales with piece importance (Pawn D6 -> King D20).
- **Greedy AI (Beta):** Added Singleplayer mode with a probabilistic decision engine.
- **Stone Plaza:** Replaced circular plane with a detailed, tiered stone stage.
- **Dynamic Terrain:** Added "Western Mound", "Eastern Plateau", and carved river systems.
- **Stat Caps:** Capped Veteran Kills and Defenses at +5.

## [0.1.0] - Initial Release
- Basic 3D Chess implementation with RPG Health and Combat.
- Low-poly procedural environment.
- Day/Night cycle.
- Combat animations.
