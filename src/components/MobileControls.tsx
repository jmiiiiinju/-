import React from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw, RotateCcw, Zap, RefreshCw } from 'lucide-react';

interface MobileControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onHold: () => void;
  disabled: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
  onHardDrop,
  onRotateCW,
  onRotateCCW,
  onHold,
  disabled,
}) => {
  const handleTouch = (action: () => void) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      action();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto pt-3 pb-2 px-2 select-none md:hidden">
      <div className="flex items-center justify-between gap-4">
        {/* Left D-Pad: Directions */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onTouchStart={handleTouch(onMoveLeft)}
              onClick={handleTouch(onMoveLeft)}
              disabled={disabled}
              className="w-14 h-14 rounded-2xl bg-slate-800/90 active:bg-cyan-600/40 border border-slate-700/80 active:border-cyan-400 active:scale-95 flex items-center justify-center text-slate-200 shadow-md transition-all touch-manipulation"
              aria-label="왼쪽으로 이동"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onTouchStart={handleTouch(onMoveRight)}
              onClick={handleTouch(onMoveRight)}
              disabled={disabled}
              className="w-14 h-14 rounded-2xl bg-slate-800/90 active:bg-cyan-600/40 border border-slate-700/80 active:border-cyan-400 active:scale-95 flex items-center justify-center text-slate-200 shadow-md transition-all touch-manipulation"
              aria-label="오른쪽으로 이동"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* Soft Drop */}
          <button
            type="button"
            onTouchStart={handleTouch(onSoftDrop)}
            onClick={handleTouch(onSoftDrop)}
            disabled={disabled}
            className="w-30 h-11 rounded-xl bg-slate-800/80 active:bg-cyan-600/40 border border-slate-700/70 active:border-cyan-400 active:scale-95 flex items-center justify-center gap-1.5 text-slate-300 text-xs font-semibold shadow-md transition-all touch-manipulation"
            aria-label="아래로 내리기"
          >
            <ArrowDown className="w-4 h-4 text-cyan-400" />
            <span>내리기</span>
          </button>
        </div>

        {/* Center: Hold & Quick Action */}
        <div className="flex flex-col items-center justify-center gap-2">
          <button
            type="button"
            onTouchStart={handleTouch(onHold)}
            onClick={handleTouch(onHold)}
            disabled={disabled}
            className="w-12 h-12 rounded-xl bg-slate-800/80 active:bg-amber-600/40 border border-slate-700/80 active:border-amber-400 active:scale-95 flex flex-col items-center justify-center text-amber-300 shadow-md transition-all touch-manipulation"
            aria-label="홀드"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-0.5 font-['Chakra_Petch']">HOLD</span>
          </button>

          <button
            type="button"
            onTouchStart={handleTouch(onRotateCCW)}
            onClick={handleTouch(onRotateCCW)}
            disabled={disabled}
            className="w-12 h-12 rounded-xl bg-slate-800/80 active:bg-blue-600/40 border border-slate-700/80 active:border-blue-400 active:scale-95 flex items-center justify-center text-blue-300 shadow-md transition-all touch-manipulation"
            aria-label="반시계방향 회전"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Right Action Cluster: Hard Drop & Rotate */}
        <div className="flex flex-col items-center gap-2">
          {/* Rotate Clockwise */}
          <button
            type="button"
            onTouchStart={handleTouch(onRotateCW)}
            onClick={handleTouch(onRotateCW)}
            disabled={disabled}
            className="w-16 h-16 rounded-full bg-cyan-600/30 active:bg-cyan-500 border border-cyan-400/80 active:scale-95 flex items-center justify-center text-cyan-200 shadow-lg shadow-cyan-500/20 transition-all touch-manipulation"
            aria-label="시계방향 회전"
          >
            <RotateCw className="w-7 h-7 text-cyan-300" />
          </button>

          {/* Hard Drop */}
          <button
            type="button"
            onTouchStart={handleTouch(onHardDrop)}
            onClick={handleTouch(onHardDrop)}
            disabled={disabled}
            className="w-16 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 active:from-purple-500 active:to-indigo-500 active:scale-95 flex items-center justify-center gap-1 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all touch-manipulation"
            aria-label="즉시 낙하"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>낙하</span>
          </button>
        </div>
      </div>
    </div>
  );
};
