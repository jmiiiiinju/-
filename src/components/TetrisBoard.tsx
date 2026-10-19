import React from 'react';
import { ActivePiece, FloatingNotice, Grid } from '../types/tetris';
import { BOARD_HEIGHT, BOARD_WIDTH, TETROMINOES } from '../utils/tetrisConstants';
import { Play, Pause } from 'lucide-react';

interface TetrisBoardProps {
  grid: Grid;
  activePiece: ActivePiece | null;
  ghostY: number;
  showGhost: boolean;
  clearingRows: number[];
  isShaking: boolean;
  floatingNotices: FloatingNotice[];
  status: 'idle' | 'playing' | 'paused' | 'gameover';
  onStart: () => void;
  onResume: () => void;
}

export const TetrisBoard: React.FC<TetrisBoardProps> = ({
  grid,
  activePiece,
  ghostY,
  showGhost,
  clearingRows,
  isShaking,
  floatingNotices,
  status,
  onStart,
  onResume,
}) => {
  // Determine if a cell is occupied by active piece
  const getActivePieceCell = (r: number, c: number) => {
    if (!activePiece) return null;
    const { shape, x, y, color, glow, border } = activePiece;
    const pr = r - y;
    const pc = c - x;

    if (pr >= 0 && pr < shape.length && pc >= 0 && pc < shape[0].length && shape[pr][pc] !== 0) {
      return { color, glow, border, isActive: true };
    }
    return null;
  };

  // Determine if a cell is occupied by ghost piece
  const getGhostPieceCell = (r: number, c: number) => {
    if (!showGhost || !activePiece || status !== 'playing') return null;
    const { shape, x, color } = activePiece;
    const pr = r - ghostY;
    const pc = c - x;

    if (pr >= 0 && pr < shape.length && pc >= 0 && pc < shape[0].length && shape[pr][pc] !== 0) {
      return { color, isGhost: true };
    }
    return null;
  };

  return (
    <div className="relative select-none flex flex-col items-center justify-center">
      {/* Board Container with Shake & Cyber Neon Frame */}
      <div
        className={`relative p-2 md:p-3 rounded-2xl bg-slate-950/90 border-2 border-slate-700/80 shadow-[0_0_35px_rgba(6,182,212,0.15)] transition-transform duration-75 ${
          isShaking ? 'translate-y-1 scale-[0.995]' : ''
        }`}
      >
        {/* Floating Action Notifications */}
        <div className="absolute inset-x-0 top-1/4 z-30 pointer-events-none flex flex-col items-center gap-2">
          {floatingNotices.map((notice) => (
            <div
              key={notice.id}
              className={`px-4 py-1.5 rounded-full backdrop-blur-md border shadow-lg animate-float-fade font-['Chakra_Petch'] font-extrabold text-sm md:text-base tracking-wide flex items-center gap-2 ${
                notice.type === 'tetris'
                  ? 'bg-purple-900/90 border-purple-400 text-purple-200 shadow-purple-500/50 scale-110'
                  : notice.type === 'combo'
                  ? 'bg-amber-900/90 border-amber-400 text-amber-200 shadow-amber-500/50'
                  : notice.type === 'levelup'
                  ? 'bg-cyan-900/90 border-cyan-400 text-cyan-200 shadow-cyan-500/50'
                  : 'bg-blue-900/90 border-blue-400 text-blue-200 shadow-blue-500/40'
              }`}
            >
              <span>{notice.text}</span>
              {notice.subText && (
                <span className="text-xs font-mono opacity-90">{notice.subText}</span>
              )}
            </div>
          ))}
        </div>

        {/* The Grid */}
        <div
          className="grid gap-[2px] bg-slate-900/95 p-1 rounded-xl border border-slate-800 relative overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
            width: 'min(78vw, 300px)',
            height: 'min(156vw, 600px)',
            aspectRatio: '10 / 20',
          }}
        >
          {/* Subtle background cyber grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:10%_5%] pointer-events-none" />

          {grid.map((row, r) => {
            const isClearing = clearingRows.includes(r);

            return row.map((cell, c) => {
              const active = getActivePieceCell(r, c);
              const ghost = !active ? getGhostPieceCell(r, c) : null;

              // Render active piece block
              if (active) {
                return (
                  <div
                    key={`${r}-${c}`}
                    className="relative rounded-[3px] transition-all"
                    style={{
                      backgroundColor: active.color,
                      boxShadow: `inset 1px 1px 2px rgba(255,255,255,0.4), inset -1px -1px 2px rgba(0,0,0,0.5), 0 0 10px ${active.glow}`,
                      border: `1px solid ${active.border}`,
                    }}
                  >
                    <div className="absolute top-[2px] left-[2px] right-[2px] h-[30%] bg-white/20 rounded-t-[2px] pointer-events-none" />
                  </div>
                );
              }

              // Render ghost piece projection
              if (ghost) {
                return (
                  <div
                    key={`${r}-${c}`}
                    className="rounded-[3px] transition-all bg-white/5 border border-dashed"
                    style={{
                      borderColor: ghost.color,
                      boxShadow: `inset 0 0 4px ${ghost.color}`,
                    }}
                  />
                );
              }

              // Render locked board cells
              if (cell) {
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`relative rounded-[3px] transition-all ${
                      isClearing ? 'bg-white shadow-[0_0_15px_#fff] scale-105 z-10 brightness-200' : ''
                    }`}
                    style={{
                      backgroundColor: isClearing ? '#ffffff' : cell.color,
                      boxShadow: isClearing
                        ? '0 0 16px rgba(255,255,255,0.9)'
                        : `inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.5), 0 0 6px ${cell.glow}`,
                      border: `1px solid ${isClearing ? '#ffffff' : cell.border}`,
                    }}
                  >
                    {!isClearing && (
                      <div className="absolute top-[2px] left-[2px] right-[2px] h-[30%] bg-white/15 rounded-t-[2px] pointer-events-none" />
                    )}
                  </div>
                );
              }

              // Empty grid cell
              return (
                <div
                  key={`${r}-${c}`}
                  className="rounded-[2px] bg-slate-950/40 border border-slate-900/60"
                />
              );
            });
          })}
        </div>

        {/* Idle Overlay */}
        {status === 'idle' && (
          <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-2xl font-black text-white font-['Chakra_Petch'] tracking-wide mb-2">
              NEON TETRIS
            </h3>
            <p className="text-xs text-slate-300 max-w-[200px] mb-5 leading-relaxed">
              블록을 회전하고 맞춰 줄을 완성하고 최고 기록에 도전하세요!
            </p>
            <button
              type="button"
              onClick={onStart}
              className="py-3 px-6 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white shadow-lg shadow-cyan-500/40 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>시작하기</span>
            </button>
          </div>
        )}

        {/* Paused Overlay */}
        {status === 'paused' && (
          <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/30 text-amber-400 mb-3">
              <Pause className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white font-['Chakra_Petch'] tracking-wide mb-1">
              PAUSED
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              게임이 일시 정지되었습니다.
            </p>
            <button
              type="button"
              onClick={onResume}
              className="py-2.5 px-6 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>계속하기 (P)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
