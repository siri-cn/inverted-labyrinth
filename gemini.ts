import { GoogleGenAI, Type } from "@google/genai";
import { MazeData, TerrainType, EnemyType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateMaze(round: number): Promise<{ maze: MazeData; lore: string; terrain: TerrainType }> {
  const size = Math.min(30, 12 + round * 2);
  const enemyCount = Math.floor(round * 2);
  
  const terrains: TerrainType[] = ['dungeon', 'cave', 'forest', 'void', 'lava', 'ice'];
  const terrain = terrains[(round - 1) % terrains.length];

  const prompt = `
    Generate a 2D maze for round ${round} of a retro RPG. 
    The maze size is ${size}x${size}.
    Terrain theme: ${terrain}.
    Rules:
    - 0: path
    - 1: wall
    - 2: start position (exactly one)
    - 3: end position (exactly one)
    - 4: enemy position (place ${enemyCount} enemies)
    - 5: secret passage (looks like a wall but is walkable, place 2-3 per level)
    - 6: coin (place at least 15-20 coins scattered on paths)
    
    CRITICAL: You MUST ensure there is a valid, walkable path (using 0s, 5s, and 6s) from the start (2) to the end (3). 
    There must be NO BLOCKS or walls (1) that prevent reaching the exit.
    Avoid creating "closed spaces" or isolated islands of paths. Every path (0) should be reachable from the start. 
    Favor open layouts with connected rooms and wider corridors rather than tight, winding single-tile paths.
    
    Difficulty Scaling for Round ${round}:
    - Increase enemy density and placement complexity.
    - Make the maze layout more intricate but still open.
    
    Also provide a short lore snippet about this level. 
    Use ONLY simple sentences. 
    Do not use complex words. 
    Example: "Aethelred enters the dark cave. He sees many skeletons."
    The theme is "The Shifting Labyrinth" and the hero "Aethelred" is hunting "The Chaos Weaver".
    The environment gets darker and more corrupted as rounds progress.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          grid: {
            type: Type.ARRAY,
            items: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER }
            }
          },
          lore: { type: Type.STRING }
        },
        required: ["grid", "lore"]
      }
    }
  });

  const data = JSON.parse(response.text);
  return {
    maze: {
      grid: data.grid,
      width: data.grid[0].length,
      height: data.grid.length
    },
    lore: data.lore,
    terrain
  };
}

export async function generateBossArena(): Promise<{ maze: MazeData; lore: string; terrain: TerrainType }> {
  const size = 40;
  const prompt = `
    Generate a massive boss arena for the final round (Round 20).
    The size is ${size}x${size}.
    Terrain theme: void.
    Rules:
    - 0: path
    - 1: wall
    - 2: start position (bottom center)
    - 3: exit portal (top center, place at the very end of a long corridor)
    - 4: obstacle/hazard (place many to create a gauntlet)
    - 7: boss spawn point (place in the middle of the path to the exit, blocking the way)
    
    CRITICAL: The arena should be a long, difficult gauntlet. 
    The player must travel through a dangerous path filled with obstacles (4) to reach the boss (7).
    The boss (7) should be placed such that the player MUST pass it to reach the exit (3).
    The exit (3) should be at the very top of the map.
    
    Provide a final epic lore snippet for the confrontation with The Chaos Weaver.
    Use ONLY simple sentences.
    Example: "Aethelred finds the Weaver. The final battle begins now."
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          grid: {
            type: Type.ARRAY,
            items: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER }
            }
          },
          lore: { type: Type.STRING }
        },
        required: ["grid", "lore"]
      }
    }
  });

  const data = JSON.parse(response.text);
  return {
    maze: {
      grid: data.grid,
      width: data.grid[0].length,
      height: data.grid.length
    },
    lore: data.lore,
    terrain: 'void'
  };
}
