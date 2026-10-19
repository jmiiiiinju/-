import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Difficulty, GameStats, HighScoreRecord } from '../types/tetris';
import { DIFFICULTIES } from '../utils/tetrisConstants';
import { Trophy, RotateCcw, Settings2, Award, Zap, Flame, Clock } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  lines: number;
  level: number;
  stats: GameStats;
  difficulty: Difficulty;
  isNewHighScore: boolean;
  previousHighScore: number;
  onRestart: () => void;
  onChangeDifficulty: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  lines,
  level,
  stats,
  difficulty,
  isNewHighScore,
  previousHighScore,
  onRestart,
  onChangeDifficulty,
}) => {
  useEffect(() => {
    if (isOpen) {
      if (isNewHighScore) {
        soundManager.playHighScore();
        // Fire celebration confetti
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#06b6d4', '#eab308', '#ec4899', '#22c55e', '#a855f7'],
          });
        } catch {
          // Ignore if confetti fails
        }
      } else {
        soundManager.playGameOver();
      }
    }
  }, [isOpen, isNewHighScore]);

  if (!isOpen) return null;

  const diffConfig = DIFFICULTIES[difficulty];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? `${mins}분 ` : ''}${secs}초`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 md:p-8 text-white overflow-hidden">
        {/* Glow Effects */}
        {isNewHighScore ? (
          <div className="absolute -top-20 inset-x-0 h-40 bg-gradient-to-b from-amber-500/25 to-transparent blur-2xl pointer-events-none" />
        ) : (
          <div className="absolute -top-20 inset-x-0 h-40 bg-gradient-to-b from-rose-500/20 to-transparent blur-2xl pointer-events-none" />
        )}

        <div className="text-center mb-6">
          {isNewHighScore ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 animate-bounce">
              <Trophy className="w-3.5 h-3.5" />
              <span>최고 기록 갱신!</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>GAME OVER</span>
            </div>
          )}

          <h2 className="text-3xl font-extrabold text-white font-['Chakra_Petch'] tracking-wide">
            {isNewHighScore ? '축하합니다! 신기록 달성' : '게임 종료'}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${diffConfig.badgeColor}`}>
              {diffConfig.name} ({diffConfig.nameEn})
            </span>
            <span className="text-xs text-slate-400">
              배율 ×{diffConfig.scoreMultiplier}
            </span>
          </div>
        </div>

        {/* Score Box */}
        <div className={`p-4 rounded-xl border text-center mb-5 ${
          isNewHighScore
            ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-500/10'
            : 'bg-slate-800/60 border-slate-700/80'
        }`}>
          <div className="text-xs uppercase font-medium text-slate-400 mb-1">
            최종 획득 점수
          </div>
          <div className={`text-4xl font-extrabold font-['Chakra_Petch'] tracking-tight ${
            isNewHighScore ? 'text-amber-400' : 'text-cyan-400'
          }`}>
            {score.toLocaleString()}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-center gap-3 text-xs text-slate-300">
            <span>이전 최고 기록:</span>
            <span className="font-mono font-semibold text-slate-200">
              {previousHighScore.toLocaleString()}
            </span>
            {isNewHighScore && score > previousHighScore && (
              <span className="text-amber-400 font-bold">
                (+{(score - previousHighScore).toLocaleString()})
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              달성 레벨
            </span>
            <span className="font-bold text-slate-200 font-mono text-sm">{level}</span>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              완성 줄 수
            </span>
            <span className="font-bold text-slate-200 font-mono text-sm">{lines}</span>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-purple-400" />
              테트리스 (4줄)
            </span>
            <span className="font-bold text-slate-200 font-mono text-sm">{stats.tetrises}회</span>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              최대 콤보
            </span>
            <span className="font-bold text-slate-200 font-mono text-sm">{stats.maxCombo > 1 ? `${stats.maxCombo}연속` : '없음'}</span>
          </div>

          <div className="col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              플레이 시간
            </span>
            <span className="font-bold text-slate-200 font-mono text-sm">
              {formatDuration(stats.durationSeconds)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/25"
          >
            <RotateCcw className="w-4 h-4" />
            <span>같은 난이도로 다시 시작</span>
          </button>

          <button
            type="button"
            onClick={onChangeDifficulty}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            <span>난이도 변경하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
