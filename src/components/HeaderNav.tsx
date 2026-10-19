import React from 'react';
import { Volume2, VolumeX, Music, Eye, EyeOff, Pause, Play, RotateCcw, HelpCircle } from 'lucide-react';

interface HeaderNavProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isBgmMuted: boolean;
  onToggleBgmMute: () => void;
  showGhost: boolean;
  onToggleGhost: () => void;
  status: 'idle' | 'playing' | 'paused' | 'gameover';
  onTogglePause: () => void;
  onRestart: () => void;
  onOpenHelp: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  isMuted,
  onToggleMute,
  isBgmMuted,
  onToggleBgmMute,
  showGhost,
  onToggleGhost,
  status,
  onTogglePause,
  onRestart,
  onOpenHelp,
}) => {
  return (
    <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-3 px-3 md:px-4 mb-2 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 shadow-md">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <span className="font-['Chakra_Petch'] font-black text-white text-base">T</span>
        </div>
        <div>
          <h1 className="text-base md:text-lg font-black tracking-wider text-white font-['Chakra_Petch'] flex items-center gap-1.5">
            <span>NEON TETRIS</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hidden sm:inline">
              ARCADE
            </span>
          </h1>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Pause / Resume */}
        {(status === 'playing' || status === 'paused') && (
          <button
            type="button"
            onClick={onTogglePause}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              status === 'paused'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={status === 'paused' ? '계속하기 (P)' : '일시정지 (P)'}
            aria-label="일시정지 토글"
          >
            {status === 'paused' ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
          </button>
        )}

        {/* Restart Button */}
        {status !== 'idle' && (
          <button
            type="button"
            onClick={onRestart}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="게임 다시 시작 (R)"
            aria-label="게임 재시작"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Ghost Toggle */}
        <button
          type="button"
          onClick={onToggleGhost}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            showGhost
              ? 'bg-slate-800/80 text-cyan-400 border-cyan-500/40'
              : 'bg-slate-800/40 text-slate-500 border-slate-800'
          }`}
          title={showGhost ? '고스트 블록 켜짐' : '고스트 블록 꺼짐'}
          aria-label="고스트 블록 토글"
        >
          {showGhost ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* SFX Mute */}
        <button
          type="button"
          onClick={onToggleMute}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            !isMuted
              ? 'bg-slate-800/80 text-cyan-400 border-cyan-500/40'
              : 'bg-slate-800/40 text-rose-400 border-slate-800'
          }`}
          title={isMuted ? '효과음 켜기' : '효과음 끄기'}
          aria-label="효과음 음소거 토글"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* BGM Toggle */}
        <button
          type="button"
          onClick={onToggleBgmMute}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            !isBgmMuted && !isMuted
              ? 'bg-slate-800/80 text-purple-400 border-purple-500/40'
              : 'bg-slate-800/40 text-slate-600 border-slate-800'
          }`}
          title={isBgmMuted ? '배경음악 켜기' : '배경음악 끄기'}
          aria-label="BGM 토글"
        >
          <Music className="w-4 h-4" />
        </button>

        {/* Help Modal */}
        <button
          type="button"
          onClick={onOpenHelp}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          title="조작법 및 게임 룰"
          aria-label="도움말"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
