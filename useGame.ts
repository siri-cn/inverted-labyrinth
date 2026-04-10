import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Position, Direction, EnemyState, EnemyType, TerrainType } from '../types';
import { generateMaze, generateBossArena } from '../lib/gemini';

const INITIAL_HEALTH = 100;
const ENEMY_HEALTH = 40;
const BOSS_HEALTH = 5000;
const TOTAL_ROUNDS = 20;

export function useGame() {
  const [state, setState] = useState<GameState>({
    round: 1,
    playerPos: { x: 0, y: 0 },
    playerHealth: INITIAL_HEALTH,
    maxPlayerHealth: INITIAL_HEALTH,
    enemies: [],
    projectiles: [],
    maze: null,
    status: 'menu',
    controlMap: {},
    lore: "Aethelred enters the Shifting Labyrinth...",
    bossAttackTimer: 0,
    terrain: 'dungeon',
    playerFacing: 'down',
    playerAnimFrame: 0,
    isPlayerAttacking: false,
    coins: 0
  });

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const shuffleControls = useCallback(() => {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    const shuffled = [...keys].sort(() => Math.random() - 0.5);
    const map: Record<string, string> = {};
    keys.forEach((key, i) => {
      map[key] = shuffled[i];
    });
    return map;
  }, []);

  const loadRound = useCallback(async (round: number) => {
    setState(s => ({ ...s, status: 'loading' }));
    try {
      const { maze, lore, terrain } = round === TOTAL_ROUNDS ? await generateBossArena() : await generateMaze(round);
      
      let startPos = { x: 0, y: 0 };
      const enemies: EnemyState[] = [];
      const enemyTypes: EnemyType[] = ['skeleton', 'slime', 'ghost', 'demon'];
      
      maze.grid.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === 2) startPos = { x, y };
          if (cell === 4) {
            const type = enemyTypes[Math.floor(Math.random() * Math.min(round, enemyTypes.length))];
            enemies.push({
              id: `enemy-${x}-${y}-${Math.random()}`,
              pos: { x, y },
              health: ENEMY_HEALTH + (round * 5),
              maxHealth: ENEMY_HEALTH + (round * 5),
              type,
              animFrame: 0,
              lastMoveTime: Date.now(),
              facing: 'down'
            });
          }
          if ((cell === 3 || cell === 7) && round === TOTAL_ROUNDS) {
             enemies.push({
              id: `boss`,
              pos: { x, y },
              health: BOSS_HEALTH,
              maxHealth: BOSS_HEALTH,
              type: 'boss',
              animFrame: 0,
              lastMoveTime: Date.now(),
              facing: 'down'
            });
          }
        });
      });

      setState(s => ({
        ...s,
        round,
        playerPos: startPos,
        playerHealth: INITIAL_HEALTH,
        enemies,
        projectiles: [],
        maze,
        lore,
        terrain,
        status: 'story',
        controlMap: shuffleControls()
      }));
    } catch (error) {
      console.error("Failed to load round:", error);
      setState(s => ({ ...s, status: 'menu' }));
    }
  }, [shuffleControls]);

  const movePlayer = useCallback((dir: Direction) => {
    const { playerPos, maze, status, enemies } = stateRef.current;
    if (status !== 'playing' || !maze) return;

    let dx = 0, dy = 0;
    if (dir === 'up') dy = -1;
    if (dir === 'down') dy = 1;
    if (dir === 'left') dx = -1;
    if (dir === 'right') dx = 1;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    setState(s => ({ 
      ...s, 
      playerFacing: dir,
      playerAnimFrame: (s.playerAnimFrame + 1) % 4
    }));

    // Bounds check
    if (newX < 0 || newX >= maze.width || newY < 0 || newY >= maze.height) return;
    
    // Wall check
    if (maze.grid[newY][newX] === 1) return;

    // Enemy check
    const enemyAtPos = enemies.find(e => e.pos.x === newX && e.pos.y === newY);
    if (enemyAtPos) {
      setState(s => ({ ...s, isPlayerAttacking: true }));
      setTimeout(() => setState(s => ({ ...s, isPlayerAttacking: false })), 200);

      // Combat!
      const updatedEnemies = enemies.map(e => {
        if (e.id === enemyAtPos.id) {
          return { ...e, health: e.health - 15, isAttacking: true };
        }
        return e;
      }).filter(e => e.health > 0);

      setState(s => {
        const newHealth = s.playerHealth - 5;
        if (newHealth <= 0) {
          return { ...s, playerHealth: 0, status: 'gameover' };
        }
        return {
          ...s,
          enemies: updatedEnemies,
          playerHealth: newHealth
        };
      });
      return;
    }

    // Goal check
    if (maze.grid[newY][newX] === 3) {
      if (stateRef.current.round === TOTAL_ROUNDS) {
        // Check if boss is dead
        const bossAlive = enemies.some(e => e.type === 'boss');
        if (bossAlive) return; // Exit blocked by boss presence
        
        setState(s => ({ ...s, status: 'victory' }));
      } else {
        setState(s => ({ ...s, status: 'transition' }));
      }
      return;
    }

    // Coin check
    if (maze.grid[newY][newX] === 6) {
      const newGrid = maze.grid.map(row => [...row]);
      newGrid[newY][newX] = 0; // Remove coin
      setState(s => ({ 
        ...s, 
        coins: s.coins + 1,
        maze: s.maze ? { ...s.maze, grid: newGrid } : null
      }));
    }

    setState(s => ({ ...s, playerPos: { x: newX, y: newY } }));
  }, []);

  // Enemy movement & health regen loop
  useEffect(() => {
    const interval = setInterval(() => {
      const { status, enemies, maze, playerPos } = stateRef.current;
      if (status === 'playing') {
        const updatedEnemies = enemies.map(e => {
          // Boss movement: actively chase player in the final round
          if (e.type === 'boss') {
            const dx = playerPos.x - e.pos.x;
            const dy = playerPos.y - e.pos.y;
            
            let moveX = 0, moveY = 0;
            let dir: Direction = e.facing;

            if (Math.abs(dx) > Math.abs(dy)) {
              moveX = dx > 0 ? 1 : -1;
              dir = dx > 0 ? 'right' : 'left';
            } else {
              moveY = dy > 0 ? 1 : -1;
              dir = dy > 0 ? 'down' : 'up';
            }

            const nx = e.pos.x + moveX;
            const ny = e.pos.y + moveY;

            if (maze && nx >= 0 && nx < maze.width && ny >= 0 && ny < maze.height && (maze.grid[ny][nx] === 0 || maze.grid[ny][nx] === 5 || maze.grid[ny][nx] === 7)) {
              if (nx !== playerPos.x || ny !== playerPos.y) {
                return { ...e, pos: { x: nx, y: ny }, facing: dir, animFrame: (e.animFrame + 1) % 4 };
              }
            }
          }

          // Random movement for non-boss enemies
          if (e.type !== 'boss' && Math.random() < 0.3) {
            const dirs: Direction[] = ['up', 'down', 'left', 'right'];
            const dir = dirs[Math.floor(Math.random() * 4)];
            let dx = 0, dy = 0;
            if (dir === 'up') dy = -1;
            if (dir === 'down') dy = 1;
            if (dir === 'left') dx = -1;
            if (dir === 'right') dx = 1;
            
            const nx = e.pos.x + dx;
            const ny = e.pos.y + dy;
            
            if (maze && nx >= 0 && nx < maze.width && ny >= 0 && ny < maze.height && (maze.grid[ny][nx] === 0 || maze.grid[ny][nx] === 5)) {
              // Check if player is there
              if (nx !== playerPos.x || ny !== playerPos.y) {
                return { ...e, pos: { x: nx, y: ny }, facing: dir, animFrame: (e.animFrame + 1) % 4 };
              }
            }
          }
          return {
            ...e,
            health: Math.min(e.maxHealth, e.health + 1),
            animFrame: (e.animFrame + 1) % 4,
            isAttacking: false
          };
        });
        setState(s => ({ ...s, enemies: updatedEnemies }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const startGame = () => loadRound(1);
  const startPlaying = () => setState(s => ({ ...s, status: 'playing' }));
  const nextRound = () => loadRound(state.round + 1);

  const upgradeVitality = useCallback(() => {
    setState(s => {
      if (s.coins >= 50) {
        return {
          ...s,
          coins: s.coins - 50,
          maxPlayerHealth: s.maxPlayerHealth + 20,
          playerHealth: s.playerHealth + 20
        };
      }
      return s;
    });
  }, []);

  // Boss Attack Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const { status, round, enemies, playerPos } = stateRef.current;
      if (status === 'playing' && round === TOTAL_ROUNDS) {
        const boss = enemies.find(e => e.type === 'boss');
        if (boss) {
          const attackRoll = Math.random();
          
          if (attackRoll < 0.4) {
            // Pattern 1: Spiral Projectiles
            const newProjectiles = [
              { id: `p-${Math.random()}`, pos: { ...boss.pos }, dir: 'up' as const, type: 'projectile' as const },
              { id: `p-${Math.random()}`, pos: { ...boss.pos }, dir: 'down' as const, type: 'projectile' as const },
              { id: `p-${Math.random()}`, pos: { ...boss.pos }, dir: 'left' as const, type: 'projectile' as const },
              { id: `p-${Math.random()}`, pos: { ...boss.pos }, dir: 'right' as const, type: 'projectile' as const },
            ];
            setState(s => ({ ...s, projectiles: [...s.projectiles, ...newProjectiles] }));
          } else if (attackRoll < 0.7) {
            // Pattern 2: Targeted Strike (Warning then hit)
            const targetPos = { ...playerPos };
            const warningId = `warn-${Math.random()}`;
            setState(s => ({ 
              ...s, 
              projectiles: [...s.projectiles, { id: warningId, pos: targetPos, dir: 'none', type: 'aoe' as const, color: 'rgba(255, 0, 0, 0.2)', life: 5 }] 
            }));
            
            setTimeout(() => {
              setState(s => {
                const isHit = s.playerPos.x === targetPos.x && s.playerPos.y === targetPos.y;
                if (isHit) {
                  return { ...s, playerHealth: Math.max(0, s.playerHealth - 25) };
                }
                return s;
              });
            }, 1000);
          } else {
            // Pattern 3: Summon Minions
            if (enemies.length < 10) {
              const summonPos = { x: boss.pos.x + (Math.random() > 0.5 ? 2 : -2), y: boss.pos.y + (Math.random() > 0.5 ? 2 : -2) };
              const newMinion = {
                id: `minion-${Math.random()}`,
                pos: summonPos,
                health: 30,
                maxHealth: 30,
                type: 'skeleton' as const,
                animFrame: 0,
                lastMoveTime: Date.now(),
                facing: 'down' as const
              };
              setState(s => ({ ...s, enemies: [...s.enemies, newMinion] }));
            }
          }
        }
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Projectile Movement Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const { status, projectiles, maze, playerPos } = stateRef.current;
      if (status === 'playing' && projectiles.length > 0) {
        const nextProjectiles = projectiles.map(p => {
          if (p.type === 'aoe') {
            return { ...p, life: (p.life || 0) - 1 };
          }
          let dx = 0, dy = 0;
          if (p.dir === 'up') dy = -1;
          if (p.dir === 'down') dy = 1;
          if (p.dir === 'left') dx = -1;
          if (p.dir === 'right') dx = 1;
          return { ...p, pos: { x: p.pos.x + dx, y: p.pos.y + dy } };
        }).filter(p => {
          if (p.type === 'aoe') return (p.life || 0) > 0;
          if (!maze) return false;
          if (p.pos.x < 0 || p.pos.x >= maze.width || p.pos.y < 0 || p.pos.y >= maze.height) return false;
          if (maze.grid[p.pos.y][p.pos.x] === 1) return false;
          
          if (p.pos.x === playerPos.x && p.pos.y === playerPos.y) {
            setState(s => {
              const newHealth = s.playerHealth - 15;
              if (newHealth <= 0) {
                return { ...s, playerHealth: 0, status: 'gameover' };
              }
              return { ...s, playerHealth: newHealth };
            });
            return false;
          }
          return true;
        });

        setState(s => ({ ...s, projectiles: nextProjectiles }));
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return {
    state,
    movePlayer,
    startGame,
    startPlaying,
    nextRound,
    upgradeVitality
  };
}
