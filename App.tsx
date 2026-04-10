/**
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { Maze } from './components/Maze';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RefreshCcw, Coins, Heart, Zap } from 'lucide-react';

export default function App() {
  const { state, movePlayer, startGame, startPlaying, nextRound, upgradeVitality } = useGame();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.status !== 'playing') return;
      
      const mappedKey = state.controlMap[e.key] || e.key;
      
      if (mappedKey === 'ArrowUp') movePlayer('up');
      if (mappedKey === 'ArrowDown') movePlayer('down');
      if (mappedKey === 'ArrowLeft') movePlayer('left');
      if (mappedKey === 'ArrowRight') movePlayer('right');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.status, state.controlMap, movePlayer]);

  const getControlHint = (key: string) => {
    const mapped = state.controlMap[key];
    if (mapped === 'ArrowUp') return <ArrowUp className="w-4 h-4" />;
    if (mapped === 'ArrowDown') return <ArrowDown className="w-4 h-4" />;
    if (mapped === 'ArrowLeft') return <ArrowLeft className="w-4 h-4" />;
    if (mapped === 'ArrowRight') return <ArrowRight className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans flex flex-col items-center justify-center p-4 selection:bg-pink-500/30 overflow-hidden relative">
      {/* Modern Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full" />
      </div>
      
      <AnimatePresence mode="wait">
        {state.status === 'menu' && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center z-10"
          >
            <h1 className="text-7xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-pink-400 to-purple-400 drop-shadow-[0_0_30px_rgba(255,105,180,0.3)]">
              INVERTED LABYRINTH
            </h1>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed text-lg">
              The controls are broken. The paths are shifting. 
              Slay the Chaos Weaver and restore reality.
              <br />
              <span className="text-pink-500 font-bold mt-2 block">CONTROLS RANDOMIZE EACH ROUND</span>
            </p>
            <button 
              onClick={startGame}
              className="px-10 py-5 bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold rounded-full shadow-[0_0_30px_rgba(255,105,180,0.4)] transition-all uppercase tracking-widest hover:scale-105 active:scale-95"
            >
              Start Journey
            </button>
          </motion.div>
        )}

        {state.status === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center z-10"
          >
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-cyan-400 animate-pulse uppercase tracking-widest">Generating Reality...</p>
          </motion.div>
        )}

        {state.status === 'story' && (
          <motion.div 
            key="story"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center z-10 max-w-2xl px-4"
          >
            <h2 className="text-4xl font-black mb-6 text-amber-500 tracking-tighter uppercase">
              Round {state.round}: {state.terrain.toUpperCase()}
            </h2>
            <div className="bg-zinc-900/80 border-2 border-zinc-800 p-8 mb-8 backdrop-blur-sm relative">
              <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-500" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-500" />
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-cyan-500" />
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-cyan-500" />
              <p className="text-xl text-zinc-300 italic leading-relaxed">
                "{state.lore}"
              </p>
            </div>
            <button 
              onClick={startPlaying}
              className="px-10 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-none border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-widest"
            >
              Continue Quest
            </button>
          </motion.div>
        )}

        {state.status === 'playing' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6 z-10 w-full max-w-5xl"
          >
            {/* HUD */}
            <div className="w-full grid grid-cols-3 items-center border-b border-white/10 pb-6">
              <div className="flex flex-col gap-1">
                <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Round</div>
                <div className="text-3xl font-black text-white">{state.round} <span className="text-zinc-600 text-sm">/ 20</span></div>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-4 w-full max-w-xs">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(state.playerHealth / state.maxPlayerHealth) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-pink-400 w-8">{state.playerHealth}</span>
                </div>
                
                <div className="flex items-center gap-4 w-full max-w-xs">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xl font-black text-yellow-400">{state.coins}</span>
                    {state.coins >= 50 && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={upgradeVitality}
                        className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded text-[10px] text-yellow-400 hover:bg-yellow-500/40 transition-colors"
                      >
                        <Zap className="w-3 h-3" /> UPGRADE (+20 HP)
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col gap-1">
                <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Threats</div>
                <div className="text-3xl font-black text-red-500">{state.enemies.length}</div>
              </div>
            </div>

            <div className="flex gap-8 items-start">
              <div className="flex flex-col gap-4">
                <Maze state={state} />
                <div className="text-center italic text-zinc-500 text-sm max-w-md">
                  "{state.lore}"
                </div>
              </div>

              {/* Controls Sidebar */}
              <div className="flex flex-col gap-6 p-6 bg-zinc-900/50 border border-white/5 rounded-2xl backdrop-blur-xl">
                <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Current Mapping</div>
                <div className="grid grid-cols-1 gap-4">
                  {['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].map(key => (
                    <div key={key} className="flex items-center gap-4 p-3 bg-black/40 rounded-xl border border-white/5">
                      <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                        {key === 'ArrowUp' && <ArrowUp className="w-5 h-5" />}
                        {key === 'ArrowDown' && <ArrowDown className="w-5 h-5" />}
                        {key === 'ArrowLeft' && <ArrowLeft className="w-5 h-5" />}
                        {key === 'ArrowRight' && <ArrowRight className="w-5 h-5" />}
                      </div>
                      <RefreshCcw className="w-4 h-4 text-pink-500/50" />
                      <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                        {getControlHint(key)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {state.status === 'transition' && (
          <motion.div 
            key="transition"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center z-10 bg-zinc-900/50 backdrop-blur-xl p-12 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.1)]"
          >
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">ROUND {state.round} COMPLETE</h2>
            <p className="text-zinc-400 mb-8 text-lg">The labyrinth shifts... the corruption deepens.</p>
            <button 
              onClick={nextRound}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold rounded-full transition-all uppercase tracking-widest hover:scale-105 active:scale-95"
            >
              Descend Further
            </button>
          </motion.div>
        )}

        {state.status === 'gameover' && (
          <motion.div 
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center z-10"
          >
            <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800 mb-4 tracking-tighter">YOU PERISHED</h2>
            <p className="text-zinc-400 mb-8 text-xl">The Weaver claims another soul.</p>
            <button 
              onClick={startGame}
              className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full transition-all uppercase tracking-widest hover:scale-105 active:scale-95"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {state.status === 'victory' && (
          <motion.div 
            key="victory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center z-10"
          >
            <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-pink-400 mb-4 tracking-tighter">VICTORY</h2>
            <p className="text-zinc-400 mb-8 text-xl">The Weaver is slain. Reality is restored.</p>
            <button 
              onClick={startGame}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold rounded-full transition-all uppercase tracking-widest hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

