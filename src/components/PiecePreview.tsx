import React from 'react';
import { TetrominoType } from '../types/tetris';
import { TETROMINOES } from '../utils/tetrisConstants';

interface PiecePreviewProps {
  type: TetrominoType | null;
  size?: 'sm' | 'md';
}

export const PiecePreview: React.FC<PiecePreviewProps> = ({ type, size = 'md' }) => {
  const cellSize = size === 'sm' ? 14 : 18;

  if (!type) {
    return (
      <div
        className="flex items-center justify-center border border-dashed border-slate-700/60 rounded-lg"
        style={{ width: cellSize * 4 + 8, height: cellSize * 3 + 8 }}
      >
        <span className="text-slate-600 text-xs font-mono">-</span>
      </div>
    );
  }

  const def = TETROMINOES[type];
  const shape = def.shape;
  const rows = shape.length;
  const cols = shape[0].length;

  return (
    <div
      className="flex items-center justify-center p-1 rounded-lg bg-slate-950/60 border border-slate-800/80 shadow-inner"
      style={{
        minWidth: cellSize * 4 + 8,
        minHeight: cellSize * 3 + 8,
      }}
    >
      <div
        className="grid gap-[2px]"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {shape.map((row, r) =>
          row.map((cell, c) => {
            const filled = cell === 1;
            return (
              <div
                key={`${r}-${c}`}
                className="rounded-[3px] transition-all"
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  backgroundColor: filled ? def.color : 'transparent',
                  boxShadow: filled ? `0 0 8px ${def.glow}` : 'none',
                  border: filled ? `1px solid ${def.border}` : 'none',
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
