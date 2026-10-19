import React from 'react';
import { Difficulty, HighScoreRecord } from '../types/tetris';
import { DIFFICULTIES } from '../utils/tetrisConstants';
import { Flame, ShieldCheck, Zap, Trophy, Play } from 'lucide-react';

interface DifficultyModalProps {
  isOpen: boolean;
  selectedDifficulty: Difficulty;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onStartGame: () => void;
  highScores: Record<Difficulty, HighScoreRecord>;
}

export const DifficultyModal: React.FC<DifficultyModalProps> = ({
  isOpen,
  selectedDifficulty,
  onSelectDifficulty,
  onStartGame,
  highScores,
}) => {
  if (!isOpen) return null;

  const difficultyList: Difficulty[] = ['easy', 'normal', 'hard'];

  const getDifficultyIcon = (diff: Difficulty) => {
    switch (diff) {
      case 'easy':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'normal':
        return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'hard':
        return <Flame className="w-5 h-5 text-rose-400 animate-pulse" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl shadow-cyan-950/50 p-6 md:p-8 text-white overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase mb-2">
            게임 설정
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-['Chakra_Petch']">
            난이도 선택
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            원하는 플레이 스타일에 맞춰 난이도를 선택하고 최고 기록에 도전하세요!
          </p>
        </div>

        {/* Difficulty Cards */}
        <div className="space-y-3 mb-6">
          {difficultyList.map((diffKey) => {
            const conf = DIFFICULTIES[diffKey];
            const isSelected = selectedDifficulty === diffKey;
            const highScore = highScores[diffKey]?.score || 0;

            return (
              <button
                key={diffKey}
                type="button"
                onClick={() => onSelectDifficulty(diffKey)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.01]'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600'
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 to-blue-500" />
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-700/60 flex items-center justify-center">
                      {getDifficultyIcon(diffKey)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-white font-['Chakra_Petch']">
                          {conf.name}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${conf.badgeColor}`}>
                          {conf.nameEn}
                        </span>
                        <span className="text-xs text-amber-400/90 font-medium">
                          ×{conf.scoreMultiplier} 배율
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {conf.description}
                      </p>
                    </div>
                  </div>

                  {/* High score badge */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 justify-end font-semibold">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>최고</span>
                    </div>
                    <div className="text-sm font-bold text-slate-200 font-mono">
                      {highScore.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Specs Pill info */}
                <div className="mt-3 pt-2.5 border-t border-slate-700/40 flex items-center gap-4 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">낙하 속도:</span>
                    <span className="font-semibold text-cyan-300">
                      {diffKey === 'easy' ? '느림 (850ms)' : diffKey === 'normal' ? '표준 (600ms)' : '빠름 (320ms)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">시작 장애물:</span>
                    <span className={`font-semibold ${conf.garbageRows > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {conf.garbageRows === 0 ? '없음 (0줄)' : `${conf.garbageRows}줄`}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Start Game Button */}
        <button
          type="button"
          onClick={onStartGame}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-base tracking-wide uppercase transition-all duration-200 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-white shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer group"
        >
          <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
          <span>게임 시작하기</span>
        </button>
      </div>
    </div>
  );
};
