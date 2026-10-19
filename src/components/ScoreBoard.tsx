import React from 'react';
import { Difficulty } from '../types/tetris';
import { DIFFICULTIES } from '../utils/tetrisConstants';
import { Trophy, Flame, Zap, Award, SlidersHorizontal } from 'lucide-react';

interface ScoreBoardProps {
  score: number;
  highScore: number;
  level: number;
  lines: number;
  combo: number;
  difficulty: Difficulty;
  onOpenDifficultyModal: () => void;
  status: 'idle' | 'playing' | 'paused' | 'gameover';
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  highScore,
  level,
  lines,
  combo,
  difficulty,
  onOpenDifficultyModal,
  status,
}) => {
  const diffConfig = DIFFICULTIES[difficulty];
  const isBreakingRecord = score > highScore && highScore > 0;

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col gap-3">
      {/* Difficulty Banner & Switch */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffConfig.badgeColor}`}>
            {diffConfig.name} ({diffConfig.nameEn})
          </span>
          <span className="text-[10px] text-amber-400 font-mono font-medium">
            ×{diffConfig.scoreMultiplier}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenDifficultyModal}
          disabled={status === 'playing'}
          title={status === 'playing' ? '게임 중에는 일시정지 후 난이도를 변경할 수 있습니다' : '난이도 설정'}
          className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition-colors cursor-pointer ${
            status === 'playing'
              ? 'text-slate-600 bg-slate-900 cursor-not-allowed'
              : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'
          }`}
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>변경</span>
        </button>
      </div>

      {/* Main Score */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider font-semibold font-['Chakra_Petch']">
          <span>SCORE</span>
          {isBreakingRecord && (
            <span className="text-[10px] text-amber-400 font-bold animate-pulse">
              ★ 최고 기록 돌파!
            </span>
          )}
        </div>
        <div className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight transition-colors ${
          isBreakingRecord ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]' : 'text-cyan-400'
        }`}>
          {score.toLocaleString()}
        </div>
      </div>

      {/* High Score */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-medium">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px]">최고 기록</span>
        </div>
        <div className="text-sm font-mono font-bold text-slate-200">
          {Math.max(score, highScore).toLocaleString()}
        </div>
      </div>

      {/* Level & Lines Progress */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-2">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-semibold">
            <Award className="w-3 h-3 text-blue-400" />
            <span>LEVEL</span>
          </div>
          <div className="text-lg font-mono font-bold text-slate-100 mt-0.5">
            {level}
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-2">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-semibold">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>LINES</span>
          </div>
          <div className="text-lg font-mono font-bold text-slate-100 mt-0.5">
            {lines}
          </div>
        </div>
      </div>

      {/* Combo Streak */}
      {combo > 1 && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-lg p-2 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold font-['Chakra_Petch']">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{combo} 연속 콤보!</span>
          </div>
          <span className="text-[11px] font-mono text-amber-300 font-bold">
            +{(combo - 1) * 50 * level}
          </span>
        </div>
      )}
    </div>
  );
};
