import React from 'react';
import { TetrominoType } from '../types/tetris';
import { PiecePreview } from './PiecePreview';

interface HoldPanelProps {
  holdPiece: TetrominoType | null;
  canHold: boolean;
}

export const HoldPanel: React.FC<HoldPanelProps> = ({ holdPiece, canHold }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-['Chakra_Petch']">
          HOLD
        </span>
        <span className="text-[10px] text-slate-500 font-mono bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50">
          C / Shift
        </span>
      </div>

      <div className={`transition-opacity duration-200 ${canHold ? 'opacity-100' : 'opacity-40'}`}>
        <PiecePreview type={holdPiece} size="md" />
      </div>

      {!canHold && holdPiece && (
        <span className="text-[9px] text-amber-500/80 font-medium mt-1">
          착지 후 교체 가능
        </span>
      )}
    </div>
  );
};
