# Inverted Labyrinth: The Modern Descent

A sleek, modern action-RPG labyrinth crawler where reality is fractured and the paths are ever-shifting.

## Features
- **Modern Aesthetic**: High-fidelity neon visuals, smooth gradients, and a cyber-knight protagonist.
- **Dynamic Labyrinth**: Procedurally generated mazes using the Gemini API, ensuring unique layouts every round.
- **Inverted Controls**: Reality is broken—your movement controls randomize every round.
- **Progression System**: Collect golden coins to upgrade your Vitality (+20 HP per 50 coins).
- **Difficulty Scaling**: Enemies grow stronger and mazes become more intricate as you descend through 20 rounds.
- **Secret Passages**: Hidden paths that look like walls but allow passage for both you and your enemies.
- **Solvability Guaranteed**: Advanced AI prompting ensures a clear, unblocked path to the exit always exists.

## Project Structure
- `src/App.tsx`: Main application shell and UI screens (Menu, HUD, Story, Victory/GameOver).
- `src/hooks/useGame.ts`: Core game logic, state management, movement, combat, and coin collection.
- `src/components/Maze.tsx`: High-performance Canvas-based renderer for the labyrinth and entities.
- `src/lib/gemini.ts`: AI-powered level generation logic.
- `src/types.ts`: TypeScript definitions for game entities and state.
- `src/index.css`: Global modern styles and typography.

## How to Play
1. Use the **Arrow Keys** to move.
2. Note the **Current Mapping** in the sidebar—your keys will change every round!
3. Collect **Coins** scattered on the floor.
4. When you have **50 Coins**, click the **UPGRADE** button in the HUD to increase your max health.
5. Reach the **Green Portal** to advance to the next round.
6. Slay the **Chaos Weaver** in Round 20 to restore reality.