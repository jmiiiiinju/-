import React from 'react';
import { X, Keyboard, Gamepad2, Award } from 'lucide-react';
import { DIFFICULTIES } from '../utils/tetrisConstants';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-lg font-['Chakra_Petch'] text-white">
              게임 조작법 & 룰 가이드
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 py-4 text-xs">
          {/* Keyboard shortcuts */}
          <div>
            <h4 className="font-bold text-sm text-cyan-300 mb-2 flex items-center gap-1.5 font-['Chakra_Petch']">
              <Keyboard className="w-4 h-4" />
              <span>키보드 조작키</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex justify-between items-center">
                <span>좌 / 우 이동</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-700">← → 또는 A D</kbd>
              </div>
              <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex justify-between items-center">
                <span>시계방향 회전</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-700">↑ 또는 W</kbd>
              </div>
              <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex justify-between items-center">
                <span>반시계방향 회전</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-700">Z</kbd>
              </div>
              <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex justify-between items-center">
                <span>소프트 드롭</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-700">↓ 또는 S</kbd>
              </div>
              <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex justify-between items-center">
                <span>하드 드롭 (즉시 낙하)</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-700">Space</kbd>
              </div>
              <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex justify-between items-center">
                <span>블록 보관 (Hold)</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-700">C 또는 Shift</kbd>
              </div>
              <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex justify-between items-center">
                <span>일시정지 / 계속</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-700">P 또는 ESC</kbd>
              </div>
              <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex justify-between items-center">
                <span>재시작</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-700">R</kbd>
              </div>
            </div>
          </div>

          {/* Difficulty Rules */}
          <div>
            <h4 className="font-bold text-sm text-cyan-300 mb-2 font-['Chakra_Petch']">
              난이도별 특징
            </h4>
            <div className="space-y-1.5 text-slate-300">
              {Object.values(DIFFICULTIES).map((diff) => (
                <div key={diff.id} className="p-2 rounded bg-slate-800/40 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-100">{diff.name} ({diff.nameEn})</span>
                    <span className="text-amber-400 font-mono font-bold">점수 배율 ×{diff.scoreMultiplier}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    시작 방해 블록 {diff.garbageRows === 0 ? '없음' : `${diff.garbageRows}줄`}, 기본 속도 {diff.initialSpeed}ms
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Score System */}
          <div>
            <h4 className="font-bold text-sm text-cyan-300 mb-2 flex items-center gap-1.5 font-['Chakra_Petch']">
              <Award className="w-4 h-4" />
              <span>점수 & 콤보 시스템</span>
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>1줄 (싱글): 100점 × 레벨 × 난이도 배율</li>
              <li>2줄 (더블): 300점 × 레벨 × 난이도 배율</li>
              <li>3줄 (트리플): 500점 × 레벨 × 난이도 배율</li>
              <li><strong className="text-purple-300">4줄 (테트리스): 800점 × 레벨 × 난이도 배율</strong></li>
              <li>연속으로 줄을 지우면 <strong>콤보 보너스</strong> 추가 획득</li>
              <li>10줄을 완성할 때마다 레벨이 오르고 블록이 더 빠르게 떨어집니다!</li>
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
