/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActivePiece,
  Difficulty,
  FloatingNotice,
  GameStats,
  Grid,
  HighScoreRecord,
  TetrominoType,
} from './types/tetris';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  DIFFICULTIES,
  generateBag,
  generateGarbageRows,
  LINE_SCORES,
} from './utils/tetrisConstants';
import {
  calculateLineScore,
  checkCollision,
  checkLineClears,
  createEmptyGrid,
  createNewPiece,
  getDropSpeed,
  getGhostY,
  mergePieceToGrid,
  tryRotate,
} from './utils/tetrisLogic';
import { getHighScores, saveHighScore } from './utils/storage';
import { soundManager } from './utils/sound';

import { HeaderNav } from './components/HeaderNav';
import { TetrisBoard } from './components/TetrisBoard';
import { HoldPanel } from './components/HoldPanel';
import { NextPanel } from './components/NextPanel';
import { ScoreBoard } from './components/ScoreBoard';
import { DifficultyModal } from './components/DifficultyModal';
import { GameOverModal } from './components/GameOverModal';
import { MobileControls } from './components/MobileControls';
import { HelpModal } from './components/HelpModal';

const INITIAL_STATS: GameStats = {
  singles: 0,
  doubles: 0,
  triples: 0,
  tetrises: 0,
  maxCombo: 0,
  piecesDropped: 0,
  startTime: 0,
  durationSeconds: 0,
};

export default function App() {
  // Game Configuration State
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [highScores, setHighScores] = useState<Record<Difficulty, HighScoreRecord>>(getHighScores());
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');

  // Board & Pieces State
  const [grid, setGrid] = useState<Grid>(() => createEmptyGrid());
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);
  const [pieceQueue, setPieceQueue] = useState<TetrominoType[]>(() => [
    ...generateBag(),
    ...generateBag(),
  ]);

  // Scores & Level Progression
  const [score, setScore] = useState<number>(0);
  const [lines, setLines] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [combo, setCombo] = useState<number>(0);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);

  // High score tracking for game over screen
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [previousHighScore, setPreviousHighScore] = useState<number>(0);

  // Visual Effects State
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [floatingNotices, setFloatingNotices] = useState<FloatingNotice[]>([]);
  const [showGhost, setShowGhost] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmMuted, setIsBgmMuted] = useState<boolean>(true);

  // Modals
  const [isDifficultyModalOpen, setIsDifficultyModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  // Refs for loop & callbacks
  const activePieceRef = useRef<ActivePiece | null>(activePiece);
  activePieceRef.current = activePiece;

  const gridRef = useRef<Grid>(grid);
  gridRef.current = grid;

  const statusRef = useRef(status);
  statusRef.current = status;

  const pieceQueueRef = useRef(pieceQueue);
  pieceQueueRef.current = pieceQueue;

  const canHoldRef = useRef(canHold);
  canHoldRef.current = canHold;

  const holdPieceRef = useRef(holdPiece);
  holdPieceRef.current = holdPiece;

  const levelRef = useRef(level);
  levelRef.current = level;

  const difficultyRef = useRef(difficulty);
  difficultyRef.current = difficulty;

  const comboRef = useRef(combo);
  comboRef.current = combo;

  const scoreRef = useRef(score);
  scoreRef.current = score;

  const linesRef = useRef(lines);
  linesRef.current = lines;

  const lockTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Trigger floating banner
  const addFloatingNotice = useCallback((notice: Omit<FloatingNotice, 'id'>) => {
    const id = Date.now() + Math.random();
    setFloatingNotices((prev) => [...prev, { ...notice, id }]);
    setTimeout(() => {
      setFloatingNotices((prev) => prev.filter((n) => n.id !== id));
    }, 1400);
  }, []);

  // Screen shake helper
  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 120);
  }, []);

  // Pop next tetromino from queue
  const popNextPiece = useCallback((): TetrominoType => {
    let currentQueue = [...pieceQueueRef.current];
    if (currentQueue.length < 7) {
      currentQueue = [...currentQueue, ...generateBag()];
    }
    const nextType = currentQueue.shift()!;
    setPieceQueue(currentQueue);
    return nextType;
  }, []);

  // Handle Game Over
  const triggerGameOver = useCallback(() => {
    setStatus('gameover');
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }

    const currentDiff = difficultyRef.current;
    const finalScore = scoreRef.current;
    const finalLines = linesRef.current;
    const finalLevel = levelRef.current;

    const playDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
    setStats((prev) => ({
      ...prev,
      durationSeconds: playDuration > 0 ? playDuration : 0,
    }));

    // Check & save high score
    const result = saveHighScore(currentDiff, finalScore, finalLines, finalLevel);
    setIsNewHighScore(result.isNewHighScore);
    setPreviousHighScore(result.previousHigh);
    setHighScores(getHighScores());
  }, []);

  // Spawn a new piece
  const spawnNextPiece = useCallback((specifiedType?: TetrominoType) => {
    const type = specifiedType || popNextPiece();
    const newPiece = createNewPiece(type);

    // Collision check at spawn position: if blocked, Game Over!
    if (checkCollision(newPiece, gridRef.current, 0, 0)) {
      triggerGameOver();
      return false;
    }

    setActivePiece(newPiece);
    setCanHold(true);
    return true;
  }, [popNextPiece, triggerGameOver]);

  // Lock active piece onto board
  const lockPiece = useCallback((pieceToLock: ActivePiece) => {
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }

    // Merge onto grid
    const mergedGrid = mergePieceToGrid(pieceToLock, gridRef.current);
    setActivePiece(null);

    setStats((prev) => ({
      ...prev,
      piecesDropped: prev.piecesDropped + 1,
    }));

    // Check line clears
    const { newGrid, clearedIndices, count } = checkLineClears(mergedGrid);

    if (count > 0) {
      // Trigger flash animation
      setClearingRows(clearedIndices);
      soundManager.playLineClear(count);

      const nextCombo = comboRef.current + 1;
      setCombo(nextCombo);

      const lineScore = calculateLineScore(count, levelRef.current, difficultyRef.current, nextCombo);
      setScore((prev) => prev + lineScore.points);

      // Line stats update
      setLines((prev) => {
        const updatedLines = prev + count;
        // Level up every 10 lines
        const nextLevel = Math.floor(updatedLines / 10) + 1;
        if (nextLevel > levelRef.current) {
          setLevel(nextLevel);
          soundManager.playLevelUp();
          addFloatingNotice({
            text: `LEVEL UP! Lv.${nextLevel}`,
            type: 'levelup',
          });
        }
        return updatedLines;
      });

      // Update stats counts
      setStats((prev) => ({
        ...prev,
        singles: count === 1 ? prev.singles + 1 : prev.singles,
        doubles: count === 2 ? prev.doubles + 1 : prev.doubles,
        triples: count === 3 ? prev.triples + 1 : prev.triples,
        tetrises: count === 4 ? prev.tetrises + 1 : prev.tetrises,
        maxCombo: Math.max(prev.maxCombo, nextCombo),
      }));

      // Floating banner
      addFloatingNotice({
        text: lineScore.label,
        subText: `+${lineScore.points.toLocaleString()}점`,
        type: lineScore.isTetris ? 'tetris' : 'single',
      });

      if (nextCombo > 1) {
        addFloatingNotice({
          text: `🔥 ${nextCombo} COMBO!`,
          type: 'combo',
        });
      }

      if (count >= 4) {
        triggerShake();
      }

      // Delay grid update so line clear flash animation is visible
      setTimeout(() => {
        setGrid(newGrid);
        setClearingRows([]);
        spawnNextPiece();
      }, 160);
    } else {
      // Reset combo if no lines cleared
      setCombo(0);
      setGrid(mergedGrid);
      spawnNextPiece();
    }
  }, [addFloatingNotice, spawnNextPiece, triggerShake]);

  // Start / Reset Game with selected difficulty
  const startGame = useCallback((targetDifficulty: Difficulty = difficulty) => {
    const diffConfig = DIFFICULTIES[targetDifficulty];
    setDifficulty(targetDifficulty);

    // Initial board: Empty + Garbage rows at the bottom
    const baseGrid = createEmptyGrid();
    if (diffConfig.garbageRows > 0) {
      const garbageRows = generateGarbageRows(diffConfig.garbageRows);
      for (let i = 0; i < diffConfig.garbageRows; i++) {
        baseGrid[BOARD_HEIGHT - diffConfig.garbageRows + i] = garbageRows[i];
      }
    }

    setGrid(baseGrid);
    setScore(0);
    setLines(0);
    setLevel(1);
    setCombo(0);
    setHoldPiece(null);
    setCanHold(true);
    setClearingRows([]);
    setFloatingNotices([]);
    setIsNewHighScore(false);
    setStats({ ...INITIAL_STATS, startTime: Date.now() });
    startTimeRef.current = Date.now();

    const freshQueue = [...generateBag(), ...generateBag()];
    const firstType = freshQueue.shift()!;
    setPieceQueue(freshQueue);

    const firstPiece = createNewPiece(firstType);
    setActivePiece(firstPiece);
    setStatus('playing');
    setIsDifficultyModalOpen(false);

    // Start background music if not muted
    if (!isBgmMuted && !isMuted) {
      soundManager.startBgm();
    }
  }, [difficulty, isBgmMuted, isMuted]);

  // Actions
  const moveLeft = useCallback(() => {
    const current = activePieceRef.current;
    if (!current || statusRef.current !== 'playing') return;

    if (!checkCollision(current, gridRef.current, -1, 0)) {
      setActivePiece({ ...current, x: current.x - 1 });
      soundManager.playMove();
    }
  }, []);

  const moveRight = useCallback(() => {
    const current = activePieceRef.current;
    if (!current || statusRef.current !== 'playing') return;

    if (!checkCollision(current, gridRef.current, 1, 0)) {
      setActivePiece({ ...current, x: current.x + 1 });
      soundManager.playMove();
    }
  }, []);

  const rotateCW = useCallback(() => {
    const current = activePieceRef.current;
    if (!current || statusRef.current !== 'playing') return;

    const rotated = tryRotate(current, gridRef.current, true);
    if (rotated) {
      setActivePiece({
        ...current,
        shape: rotated.newShape,
        x: rotated.newX,
        y: rotated.newY,
      });
      soundManager.playRotate();
    }
  }, []);

  const rotateCCW = useCallback(() => {
    const current = activePieceRef.current;
    if (!current || statusRef.current !== 'playing') return;

    const rotated = tryRotate(current, gridRef.current, false);
    if (rotated) {
      setActivePiece({
        ...current,
        shape: rotated.newShape,
        x: rotated.newX,
        y: rotated.newY,
      });
      soundManager.playRotate();
    }
  }, []);

  const softDrop = useCallback(() => {
    const current = activePieceRef.current;
    if (!current || statusRef.current !== 'playing') return;

    if (!checkCollision(current, gridRef.current, 0, 1)) {
      setActivePiece({ ...current, y: current.y + 1 });
      setScore((prev) => prev + LINE_SCORES.softDropPerCell);
      soundManager.playDrop();
    } else {
      // Locked by drop
      lockPiece(current);
    }
  }, [lockPiece]);

  const hardDrop = useCallback(() => {
    const current = activePieceRef.current;
    if (!current || statusRef.current !== 'playing') return;

    const targetY = getGhostY(current, gridRef.current);
    const dropDistance = targetY - current.y;

    const droppedPiece = { ...current, y: targetY };
    setActivePiece(droppedPiece);
    setScore((prev) => prev + dropDistance * LINE_SCORES.hardDropPerCell);

    soundManager.playHardDrop();
    triggerShake();
    lockPiece(droppedPiece);
  }, [lockPiece, triggerShake]);

  const holdCurrentPiece = useCallback(() => {
    const current = activePieceRef.current;
    if (!current || !canHoldRef.current || statusRef.current !== 'playing') return;

    soundManager.playHold();
    const currentType = current.type;
    const previouslyHeld = holdPieceRef.current;

    setHoldPiece(currentType);
    setCanHold(false);

    if (previouslyHeld) {
      spawnNextPiece(previouslyHeld);
    } else {
      spawnNextPiece();
    }
  }, [spawnNextPiece]);

  // Pause / Resume
  const togglePause = useCallback(() => {
    setStatus((prev) => {
      if (prev === 'playing') {
        soundManager.stopBgm();
        return 'paused';
      }
      if (prev === 'paused') {
        if (!isBgmMuted && !isMuted) {
          soundManager.startBgm();
        }
        return 'playing';
      }
      return prev;
    });
  }, [isBgmMuted, isMuted]);

  // Sound Toggles
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundManager.setMuted(next);
      return next;
    });
  }, []);

  const handleToggleBgmMute = useCallback(() => {
    setIsBgmMuted((prev) => {
      const next = !prev;
      soundManager.setBgmMuted(next);
      return next;
    });
  }, []);

  // Main Drop Game Loop
  useEffect(() => {
    if (status !== 'playing' || !activePiece) return;

    const intervalTime = getDropSpeed(level, difficulty);

    const timer = setInterval(() => {
      const current = activePieceRef.current;
      if (!current) return;

      if (!checkCollision(current, gridRef.current, 0, 1)) {
        setActivePiece((prev) => (prev ? { ...prev, y: prev.y + 1 } : null));
      } else {
        // Piece reached floor or block - initiate lock delay
        if (!lockTimerRef.current) {
          lockTimerRef.current = window.setTimeout(() => {
            if (activePieceRef.current) {
              lockPiece(activePieceRef.current);
            }
          }, 450);
        }
      }
    }, intervalTime);

    return () => {
      clearInterval(timer);
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
    };
  }, [status, activePiece, level, difficulty, lockPiece]);

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is in an input or modal is open (except pause/esc)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        togglePause();
        return;
      }

      if (e.code === 'KeyR' && status !== 'idle') {
        e.preventDefault();
        startGame(difficulty);
        return;
      }

      if (status !== 'playing') return;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          softDrop();
          break;
        case 'ArrowUp':
        case 'KeyW':
          e.preventDefault();
          rotateCW();
          break;
        case 'KeyZ':
          e.preventDefault();
          rotateCCW();
          break;
        case 'Space':
          e.preventDefault();
          hardDrop();
          break;
        case 'KeyC':
        case 'ShiftLeft':
        case 'ShiftRight':
          e.preventDefault();
          holdCurrentPiece();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, difficulty, togglePause, startGame, moveLeft, moveRight, softDrop, rotateCW, rotateCCW, hardDrop, holdCurrentPiece]);

  const ghostY = activePiece ? getGhostY(activePiece, grid) : 0;
  const currentHighScore = highScores[difficulty]?.score || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-2 sm:p-4 select-none relative overflow-x-hidden font-['Pretendard']">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Navigation */}
      <HeaderNav
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isBgmMuted={isBgmMuted}
        onToggleBgmMute={handleToggleBgmMute}
        showGhost={showGhost}
        onToggleGhost={() => setShowGhost((prev) => !prev)}
        status={status}
        onTogglePause={togglePause}
        onRestart={() => startGame(difficulty)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* Main Game Layout */}
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-4 sm:gap-6 w-full">
          {/* Left Column (Hold Piece & Score Info on desktop) */}
          <div className="hidden md:flex flex-col gap-4 w-44">
            <HoldPanel holdPiece={holdPiece} canHold={canHold} />
            <ScoreBoard
              score={score}
              highScore={currentHighScore}
              level={level}
              lines={lines}
              combo={combo}
              difficulty={difficulty}
              onOpenDifficultyModal={() => setIsDifficultyModalOpen(true)}
              status={status}
            />
          </div>

          {/* Center Column: The Tetris Board */}
          <div className="flex flex-col items-center">
            {/* Mobile Top Bar (Quick Score & Hold/Next compact preview) */}
            <div className="flex md:hidden items-center justify-between w-full max-w-[320px] mb-2 px-1 gap-2">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${DIFFICULTIES[difficulty].badgeColor}`}>
                  {DIFFICULTIES[difficulty].name}
                </span>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {score.toLocaleString()}점
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-400 font-mono">
                  최고 {Math.max(score, currentHighScore).toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => setIsDifficultyModalOpen(true)}
                  disabled={status === 'playing'}
                  className="text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300 disabled:opacity-40"
                >
                  난이도
                </button>
              </div>
            </div>

            {/* Mobile Mini Hold & Next Bar */}
            <div className="flex md:hidden items-center justify-between w-full max-w-[320px] mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-['Chakra_Petch']">HOLD:</span>
                <div className={`transition-opacity ${canHold ? 'opacity-100' : 'opacity-40'}`}>
                  <HoldPanel holdPiece={holdPiece} canHold={canHold} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-['Chakra_Petch']">NEXT:</span>
                <NextPanel nextQueue={pieceQueue} />
              </div>
            </div>

            {/* Tetris Board */}
            <TetrisBoard
              grid={grid}
              activePiece={activePiece}
              ghostY={ghostY}
              showGhost={showGhost}
              clearingRows={clearingRows}
              isShaking={isShaking}
              floatingNotices={floatingNotices}
              status={status}
              onStart={() => startGame(difficulty)}
              onResume={togglePause}
            />
          </div>

          {/* Right Column (Next Piece Queue & Key Guide on desktop) */}
          <div className="hidden md:flex flex-col gap-4 w-44">
            <NextPanel nextQueue={pieceQueue} />

            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-3 shadow-lg text-[11px] text-slate-400">
              <div className="font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>빠른 조작 안내</span>
                <span className="text-[9px] text-cyan-400 font-mono">키보드</span>
              </div>
              <ul className="space-y-1 text-[10px]">
                <li className="flex justify-between"><span>이동:</span> <kbd className="text-slate-200">← →</kbd></li>
                <li className="flex justify-between"><span>회전:</span> <kbd className="text-slate-200">↑ / Z</kbd></li>
                <li className="flex justify-between"><span>낙하:</span> <kbd className="text-cyan-300">Space</kbd></li>
                <li className="flex justify-between"><span>홀드:</span> <kbd className="text-amber-300">C</kbd></li>
                <li className="flex justify-between"><span>일시정지:</span> <kbd className="text-slate-200">P</kbd></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile / Touchscreen On-screen Controls */}
        <MobileControls
          onMoveLeft={moveLeft}
          onMoveRight={moveRight}
          onSoftDrop={softDrop}
          onHardDrop={hardDrop}
          onRotateCW={rotateCW}
          onRotateCCW={rotateCCW}
          onHold={holdCurrentPiece}
          disabled={status !== 'playing'}
        />
      </main>

      {/* Difficulty Selection Modal */}
      <DifficultyModal
        isOpen={isDifficultyModalOpen}
        selectedDifficulty={difficulty}
        onSelectDifficulty={(diff) => setDifficulty(diff)}
        onStartGame={() => startGame(difficulty)}
        highScores={highScores}
      />

      {/* Game Over Modal with High Score Recognition */}
      <GameOverModal
        isOpen={status === 'gameover'}
        score={score}
        lines={lines}
        level={level}
        stats={stats}
        difficulty={difficulty}
        isNewHighScore={isNewHighScore}
        previousHighScore={previousHighScore}
        onRestart={() => startGame(difficulty)}
        onChangeDifficulty={() => {
          setStatus('idle');
          setIsDifficultyModalOpen(true);
        }}
      />

      {/* Help & Rules Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Subtle Footer */}
      <footer className="text-center py-2 text-[11px] text-slate-500">
        <span>네온 테트리스 아케이드 • 7-Bag 공식 난수 생성 &amp; SRS 회전 시스템 탑재</span>
      </footer>
    </div>
  );
}
