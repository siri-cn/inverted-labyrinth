import React, { useRef, useEffect } from 'react';
import { GameState, Position, Direction, EnemyType, TerrainType } from '../types';

interface MazeProps {
  state: GameState;
}

const TILE_SIZE = 48; // Larger tiles for better detail

export const Maze: React.FC<MazeProps> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !state.maze) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { grid, width, height } = state.maze;
    canvas.width = width * TILE_SIZE;
    canvas.height = height * TILE_SIZE;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Terrain Colors/Styles
    const getTerrainStyles = (terrain: TerrainType) => {
      switch (terrain) {
        case 'cave': return { wall: '#2d1b0f', path: '#120b06', accent: '#ff8c00' };
        case 'forest': return { wall: '#062d06', path: '#031203', accent: '#32cd32' };
        case 'lava': return { wall: '#2d0606', path: '#120303', accent: '#ff4500' };
        case 'ice': return { wall: '#1e3a5f', path: '#0a1a2f', accent: '#00ffff' };
        case 'void': return { wall: '#1a001a', path: '#050005', accent: '#ff00ff' };
        default: return { wall: '#1a1a1a', path: '#0a0a0a', accent: '#00d4ff' };
      }
    };

    const styles = getTerrainStyles(state.terrain);

    // Draw Grid
    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1 || cell === 5) {
          // Wall or Secret Passage
          const gradient = ctx.createLinearGradient(x * TILE_SIZE, y * TILE_SIZE, (x + 1) * TILE_SIZE, (y + 1) * TILE_SIZE);
          gradient.addColorStop(0, styles.wall);
          gradient.addColorStop(1, '#000');
          ctx.fillStyle = gradient;
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          
          // Modern border
          ctx.strokeStyle = styles.accent + '44';
          ctx.lineWidth = 1;
          ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        } else {
          // Path
          ctx.fillStyle = styles.path;
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          
          // Modern floor detail (subtle glow)
          if ((x + y) % 6 === 0) {
            ctx.fillStyle = styles.accent + '11';
            ctx.beginPath();
            ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (cell === 6) {
          // Coin
          const time = Date.now() / 300;
          const bounce = Math.sin(time) * 3;
          ctx.fillStyle = '#ffd700';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ffd700';
          ctx.beginPath();
          ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2 + bounce, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        if (cell === 3) {
          // Goal/Portal
          const time = Date.now() / 500;
          const pulse = Math.sin(time) * 5;
          ctx.fillStyle = '#00ff00';
          ctx.shadowBlur = 15 + pulse;
          ctx.shadowColor = '#00ff00';
          ctx.beginPath();
          ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, (TILE_SIZE / 3) + pulse / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        if (cell === 7) {
          // Boss Spawn Point (Dark energy)
          const time = Date.now() / 400;
          const pulse = Math.sin(time) * 8;
          ctx.fillStyle = '#4b0082';
          ctx.shadowBlur = 20 + pulse;
          ctx.shadowColor = '#ff00ff';
          ctx.beginPath();
          ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, (TILE_SIZE / 2.5) + pulse / 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
    });

    // Draw Projectiles
    state.projectiles.forEach(p => {
      if (p.type === 'aoe') {
        ctx.fillStyle = p.color || 'rgba(255, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(p.pos.x * TILE_SIZE + TILE_SIZE / 2, p.pos.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE * 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffff00';
        ctx.beginPath();
        ctx.arc(p.pos.x * TILE_SIZE + TILE_SIZE / 2, p.pos.y * TILE_SIZE + TILE_SIZE / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Draw Character Helper
    const drawCharacter = (x: number, y: number, type: EnemyType | 'player', facing: Direction, frame: number, isAttacking: boolean = false) => {
      const px = x * TILE_SIZE + TILE_SIZE / 2;
      const py = y * TILE_SIZE + TILE_SIZE / 2;
      const bounce = Math.sin(Date.now() / 150) * 3;
      const attackOffset = isAttacking ? 10 : 0;

      ctx.save();
      ctx.translate(px, py + bounce);
      
      if (facing === 'left') ctx.scale(-1, 1);

      if (type === 'player') {
        // Modern Hero - Pink Cyber Knight
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff69b4';
        
        // Body
        ctx.fillStyle = '#ff1493';
        ctx.beginPath();
        ctx.roundRect(-12, -15, 24, 30, 8);
        ctx.fill();
        
        // Helmet
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.roundRect(-10, -28, 20, 18, 5);
        ctx.fill();
        
        // Visor (Glowing)
        ctx.fillStyle = '#fff';
        ctx.fillRect(-7, -22, 14, 4);
        
        // Sword (Energy Blade)
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(30 + attackOffset, -20 - attackOffset);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
      } else if (type === 'skeleton') {
        ctx.fillStyle = '#eee';
        ctx.fillRect(-10, -20, 20, 30);
        ctx.fillStyle = '#000';
        ctx.fillRect(-6, -15, 4, 4);
        ctx.fillRect(2, -15, 4, 4);
      } else if (type === 'slime') {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
        ctx.beginPath();
        ctx.ellipse(0, 5, 18, 12 + bounce, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'ghost') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(0, -10, 15, Math.PI, 0);
        ctx.lineTo(15, 15);
        ctx.lineTo(10, 10);
        ctx.lineTo(5, 15);
        ctx.lineTo(0, 10);
        ctx.lineTo(-5, 15);
        ctx.lineTo(-10, 10);
        ctx.lineTo(-15, 15);
        ctx.fill();
      } else if (type === 'demon') {
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(-15, -25); ctx.lineTo(0, 10); ctx.lineTo(15, -25);
        ctx.fill();
        ctx.fillRect(-10, -10, 20, 25);
      } else if (type === 'boss') {
        // The Chaos Weaver - Final Form
        const scale = 3.5;
        ctx.scale(scale, scale);
        
        // Core
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff00ff';
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing Aura
        const pulse = Math.sin(Date.now() / 200) * 2;
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 15 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Legs/Tendrils
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 + (Date.now() / 300);
          const length = 25 + Math.sin(Date.now() / 100 + i) * 5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(
            Math.cos(angle + 0.5) * length / 2, 
            Math.sin(angle + 0.5) * length / 2,
            Math.cos(angle) * length, 
            Math.sin(angle) * length
          );
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    };

    // Draw Enemies
    state.enemies.forEach(e => {
      drawCharacter(e.pos.x, e.pos.y, e.type, e.facing, e.animFrame, e.isAttacking);
      
      // Health bar
      const hbWidth = TILE_SIZE * 0.8;
      const hbx = e.pos.x * TILE_SIZE + (TILE_SIZE - hbWidth) / 2;
      const hby = e.pos.y * TILE_SIZE - 5;
      ctx.fillStyle = '#f00';
      ctx.fillRect(hbx, hby, hbWidth, 4);
      ctx.fillStyle = '#0f0';
      ctx.fillRect(hbx, hby, hbWidth * (e.health / e.maxHealth), 4);
    });

    // Draw Player
    drawCharacter(state.playerPos.x, state.playerPos.y, 'player', state.playerFacing, state.playerAnimFrame, state.isPlayerAttacking);

  }, [state]);

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black">
      <canvas 
        ref={canvasRef}
        className="block"
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-blue-500/5 via-transparent to-pink-500/5" />
    </div>
  );
};
