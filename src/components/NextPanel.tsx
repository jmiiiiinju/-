import React from 'react';
import { TetrominoType } from '../types/tetris';
import { PiecePreview } from './PiecePreview';

interface NextPanelProps {
  nextQueue: TetrominoType[];
}

export const NextPanel: React.FC<NextPanelProps> = ({ nextQueue }) => {
  // Show up to 3 upcoming pieces
  const upcoming = nextQueue.slice(0, 3);

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-['Chakra_Petch']">
          NEXT
        </span>
        <span className="text-[10px] text-cyan-400 font-mono">
          다음 블록
        </span>
      </div>

      <div className="flex flex-col gap-2.5 items-center">
        {upcoming.map((type, idx) => (
          <div
            key={idx}
            className={`transition-all ${idx === 0 ? 'scale-105' : 'scale-90 opacity-70'}`}
          >
            <PiecePreview type={type} size={idx === 0 ? 'md' : 'sm'} />
          </div>
        ))}
      </div>
    </div>
  );
};
