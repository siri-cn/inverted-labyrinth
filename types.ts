export type CellType = 'path' | 'wall' | 'start' | 'end' | 'enemy' | 'boss' | 'secret' | 'coin';
export type TerrainType = 'dungeon' | 'cave' | 'forest' | 'void' | 'lava' | 'ice';

export interface Position {
  x: number;
  y: number;
}

export type AttackType = 'projectile' | 'aoe' | 'targeted' | 'summon';
export type EnemyType = 'skeleton' | 'slime' | 'ghost' | 'demon' | 'boss';

export interface Projectile {
  id: string;
  pos: Position;
  dir: Direction | 'none';
  type: AttackType;
  color?: string;
  life?: number;
}

export interface EnemyState {
  id: string;
  pos: Position;
  health: number;
  maxHealth: number;
  type: EnemyType;
  animFrame: number;
  lastMoveTime: number;
  facing: Direction;
  isAttacking?: boolean;
}

export interface MazeData {
  grid: number[][];
  width: number;
  height: number;
}

export interface GameState {
  round: number;
  playerPos: Position;
  playerHealth: number;
  maxPlayerHealth: number;
  enemies: EnemyState[];
  projectiles: Projectile[];
  maze: MazeData | null;
  status: 'menu' | 'loading' | 'story' | 'playing' | 'transition' | 'gameover' | 'victory';
  controlMap: Record<string, string>;
  lore: string;
  bossAttackTimer: number;
  terrain: TerrainType;
  playerFacing: Direction;
  playerAnimFrame: number;
  isPlayerAttacking: boolean;
  coins: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';
